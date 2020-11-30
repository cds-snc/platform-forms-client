const { routeUtils, getSessionData } = require('./../../utils')
const { Schema } = require('./schema.js')
const { getBenefits, getProvincialBenefits, getAllBenefits } = require('./getBenefits')
const _ = require('lodash')


const getData = (req, res) => {
  /**
   * If there's querystring data use it,
   * otherwise get it from the session.
   */
  if (req.query === undefined || _.isEmpty(req.query)) {
    return getSessionData(req);
  }
  try {
    return JSON.parse(Buffer.from(req.query.q, 'base64').toString())
  } catch (err) {
    res.locals.log(`Thrown error: ${JSON.stringify(err)} Invalid QueryString ${JSON.stringify(req.query)}`)
    return {}
  }
}

module.exports = (app, route) => {
  const name = route.name

  route.draw(app)
    .get((req, res) => {
      const data = getData(req, res);

      // get All Benefits (except provinces and GST)
      const benefitsFullList = _.pull(getAllBenefits(req.locals.featureFlags), 'gst_credit');

      const benefits = getBenefits(data, req.locals.featureFlags);
      let unavailableBenefits = benefitsFullList.filter((benefit) => !benefits.includes(benefit))

      // We need to remove DTC if the user matches one of the variants
      if (benefits.find((ele) => ele.match(/^dtc_*/)) !== undefined){
        unavailableBenefits = unavailableBenefits.filter((ele) => ele !== 'dtc')
      }

      const provincial = getProvincialBenefits(data);

      let title = res.__n('results_title', benefits.length);

      if (benefits.length === 0) {
        title = res.__('results_title_no_results');
      }

      res.render(name, routeUtils.getViewData(req, {
        benefits: benefits,
        unavailableBenefits: unavailableBenefits,
        provincial: provincial,
        no_results: benefits.length === 0,
        title: title,
        data: data,
      }))
    })
    .post(route.applySchema(Schema), route.doRedirect())
}
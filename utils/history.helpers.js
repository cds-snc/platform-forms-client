
const setHistory = (req, res) => {
  if (req.session.history === undefined) {
    req.session.history = []
  }
  if (req.url !== undefined)
  {
    req.session.history.push(req.url)
  }

}

module.exports = {
  setHistory,
}
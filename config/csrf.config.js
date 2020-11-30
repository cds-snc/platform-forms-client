// istanbul ignore file 
const getCsrfConfig = () => {
  if (process.env.NODE_ENV === 'production') {
    return {
      cookie: {
        sameSite: true,
        secure: true,
      },
      signed: true,
    }
  }
  return {
    cookie: {
      sameSite: true,
    },
    signed: true,
  }
}


module.exports = getCsrfConfig();

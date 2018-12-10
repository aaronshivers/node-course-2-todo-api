const {User} = require('../models/user')

const authenticate = (req, res, next) => {
  const token = req.cookies.token

  User.findByToken(token).then((user) => {
    if (!user) {
      return Promise.reject()
    }
    req.user = user
    req.token = token
    next()
  }).catch((err) => {
    res.status(401).send('Authentication Error')
  })
}

module.exports = {authenticate}

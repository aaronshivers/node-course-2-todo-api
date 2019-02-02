const { User } = require('../models/user')

const authenticate = async (req, res, next) => {
  const token = req.cookies.token

  try {
    const user = await User.findByToken(token)
    if (!user) return Promise.reject()

    req.user = user
    req.token = token
    next()
  } catch (error) {
    res.status(401).send('Authentication Error')
  }
}

module.exports = { authenticate }

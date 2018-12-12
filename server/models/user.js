const validator = require('validator')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
const bcrypt = require('bcrypt')
const saltingRounds = 10

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    minlength: 5,
    trim: true,
    validate: {
      validator: validator.isEmail,
      message: `{VALUE} is not a valid email address.`
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    trim: true
  },
  tokens: [{
    access: {
      type: String,
      required: true
    },
    token: {
      type: String,
      required: true
    }
  }]
})

userSchema.methods.toJSON = function () {
  const user = this
  const userObject = user.toObject()

  return _.pick(userObject, ['_id', 'email'])
}

userSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const payload = {_id: user._id.toHexString(), access}
  const secret = process.env.JWT_SECRET
  const options = { expiresIn: '2d', issuer: 'https://www.demo.com' }
  const token = jwt.sign(payload, secret, options).toString()

  user.tokens.push({access, token})
  // user.tokens = user.tokens.concat([{access, token}])

  return user.save().then(() => {
    return token
  })
}

userSchema.methods.removeToken = function (token) {
  const user = this

  return user.update({
    $pull: {
      tokens: {token}
    }
  })
}

userSchema.statics.findByToken = function (token) {
  let User = this
  let decoded
    
  try {
    const secret = process.env.JWT_SECRET
    decoded = jwt.verify(token, secret)

  } catch (err) {
    
    return Promise.reject()
  }
  return User.findOne({
    '_id': decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth'
  })
}

userSchema.statics.findByCredentials = function (email, password) {
  const User = this

  return User.findOne({email}).then((user) => {
    if (!user) {
      return Promise.reject()
    }
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, user.password, (err, hash) => {
        if (hash) {
          resolve(user)
        } else {
          reject()
        }
      })
    })
  })
}

userSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcrypt.hash(user.password, saltingRounds, (err, hash) => {
      if (err) {
        next(err)
      } else {
        user.password = hash
        next()
      }
    })
  } else {
    next()
  }
})

const User = mongoose.model('User', userSchema)

module.exports = {User}

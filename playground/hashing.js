const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const saltRounds = 10

const password = 'pass123'

bcrypt.hash(password, saltRounds, (err, hash) => {
  console.log(hash)
})

const hashedPassword = '$2b$10$UQemeOC.x0m/zkV73glgXusoJnJyndmzsxTy9ruSVCEVGf8h9m6Ay'

bcrypt.compare(password, hashedPassword, (err, res) => {
  console.log(res)
})

// const data = {
//   id: 4,
//   color: 'red'
// }

// const payload = data
// const secret = 'secret'
// const options = { expiresIn: '2d', issuer: 'http://www.demo.com'}

// const token = jwt.sign(payload, secret, options)
// console.log(token)

// const decoded = jwt.verify(token, secret)
// console.log('decoded', decoded)

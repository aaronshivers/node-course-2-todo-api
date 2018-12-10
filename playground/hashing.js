// const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const saltRounds = 10

const password = '12341234'

bcrypt.hash(password, saltRounds, (err, hash) => {
  console.log(hash)
})

const hashedPassword = '$2b$10$aO4rb4dQaXLTlYk6YGafzOhex24EdoBoWoIe9RykKw9Z6wWE7l.7a'

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

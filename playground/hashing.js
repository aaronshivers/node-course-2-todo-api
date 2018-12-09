const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const saltRounds = 10

const data = {
	id: 4,
	color: 'red'
}

const payload = data
const secret = 'secret'
const options = { expiresIn: '2d', issuer: 'http://www.demo.com'}

const token = jwt.sign(payload, secret, options)
// console.log(token)

const decoded = jwt.verify(token, secret)
console.log('decoded', decoded)

const validator = require('validator')
// import {isEmail} from 'validator/lib/isEmail' 
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const _ = require('lodash')
// const {Todo}	 = require('../models/todo')

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
	// todos: [{
	// 	type: mongoose.Schema.Types.ObjectId,
	// 	ref: 'Todo',
	// 	unique: true
	// }]
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
	const token = jwt.sign(payload, secret).toString()

	user.tokens.push({access, token})
	// user.tokens = user.tokens.concat([{access, token}])

	return user.save().then(() => {
		return token
	})
}

const User = mongoose.model('User', userSchema)

module.exports = {User}

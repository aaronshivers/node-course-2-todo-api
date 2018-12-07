const mongoose = require('mongoose')
// const {Todo}	 = require('../models/todo')

const User = mongoose.model('User', {
	email: {
		type: String,
		required: true,
		unique: true,
		minlength: 5,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 8,
		trim: true
	},
	todos: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Todo',
		unique: true
	}]
})

module.exports = { User }

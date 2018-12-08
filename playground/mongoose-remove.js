require('dotenv').config()

const {ObjectId} = require('mongodb')

const {mongoose} = require('../server/db/mongoose')
const {Todo} = require('../server/models/todo')
const {User} = require('../server/models/user')

// Todo.remove({}).then((result) => {
// 	console.log(result)
// })

// Todo.findOneAndRemove
// Todo.findByIdAndRemove

const id = '5c0bcfc4cad3c064a99e4c32'

// Todo.findOneAndRemove({_id: id}).then((todo) => {
// 	console.log(todo)
// })

// Todo.findByIdAndRemove(id).then((todo) => {
// 	console.log(todo)
// })
require('dotenv').config()

const {ObjectId} = require('mongodb')

const {mongoose} = require('../server/db/mongoose')
const {Todo} = require('../server/models/todo')
const {User} = require('../server/models/user')

// const id = '5c0ad3699e436844a2279717'

// if (!ObjectId.isValid(id)) {
//   console.log('Id not valid')
// }

// Todo.find({
//   _id: id
// }).then((todos) => {
//   console.log('Todos', todos)
// })

// Todo.findOne({
//   _id: id
// }).then((todo) => {
//   console.log('Todo', todo)
// })

// Todo.findById(id).then((todo) => {
//   if (!todo) {
//     return console.log('Id not found')
//   }
//   console.log('Todo by Id', todo)
// }).catch((err) => console.log(err))

const id = '5bf5faa27a778e70eba7cfe7'

User.findById(id).then((user) => {
  if (!user) {
    return console.log('User not found.')
  }
  console.log(JSON.stringify(user, undefined, 2))
}).catch((err) => console.log(err))

require('dotenv').config()
require('./config/config')

const _ = require('lodash')
const  express = require('express')
const cookieParser = require('cookie-parser')

const {ObjectId} = require('mongodb')
const  {mongoose} = require('./db/mongoose')
const  {Todo} = require('./models/todo')
const  {User} = require('./models/user')
const {authenticate} = require('./middleware/authenticate')

const  app = express()  
const  port = process.env.PORT

// App Config
app.use(express.json())
app.use(cookieParser())

app.get('/', (req, res) => {
  res.send(`
    <h1>Todo Application</h1>
    <ul>
      <li><a href="/todos">View Todos</a></li>
      <li><a href="/users">View Users</a></li>
    </ul>`)
})

// Post Todo
app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

// Get all Todos
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos})
  }, (err) => {
    res.status(400).send(err)
  })
})

// Get Todo by Id
app.get('/todos/:id', (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  Todo.findById(id).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  }).catch((err) => {
    res.status(400).send('Database Error')
  })
})

// Delete Todo by Id
app.delete('/todos/:id', (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }
  
  Todo.findByIdAndRemove(id).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  }).catch((err) => {
    res.status(400).send('Database Error')
  })
})

// Patch Todo
app.patch('/todos/:id', (req, res) => {
  const id = req.params.id
  const body = _.pick(req.body, ['text', 'completed'])

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime()
  } else {
    body.completed = false
    body.completedAt = null
  }

  Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  }).catch((err) => {
    res.status(400).send('Database Error')
  })
})

// POST /users
app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)

  user.save().then(() => {
    return user.generateAuthToken()
  }).then((token) => {
    // res.header('x-auth', token).send(user)
    res.cookie('token', token).send(user)
    // console.log(req.cookies.token)
  }).catch((err) => {
    res.status(400).send(err)
  })
})

// Private route
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})

module.exports = {app}
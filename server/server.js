require('dotenv').config()
require('./config/config')

const  _ = require('lodash')
const  express = require('express')
const  cookieParser = require('cookie-parser')

const  {ObjectId} = require('mongodb')
const  {mongoose} = require('./db/mongoose')
const  {Todo} = require('./models/todo')
const  {User} = require('./models/user')
const  {authenticate} = require('./middleware/authenticate')

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
app.post('/todos', authenticate, (req, res) => {
  const todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  })

  todo.save().then((doc) => {
    res.send(doc)
  }, (err) => {
    res.status(400).send(err)
  })
})

// Get all Todos
app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos})
  }, (err) => {
    res.status(400).send(err)
  })
})

// Get Todo by Id
app.get('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  }).catch((err) => {
    res.status(400).send('Database Error')
  })
})

// Delete Todo by Id
app.delete('/todos/:id', authenticate, (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }
  
  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  }).catch((err) => {
    res.status(400).send('Database Error')
  })
})

// Patch Todo
app.patch('/todos/:id', authenticate, (req, res) => {
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

  Todo.findOneAndUpdate({
    _id: id,
    _creator: req.user._id
  }, {$set: body}, {new: true}).then((todo) => {
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
    res.cookie('token', token).send(user)
  }).catch((err) => {
    res.status(400).send(err)
  })
})

// Private route
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// POST /users/login
app.post('/users/login', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.cookie('token', token).send(user)
    })
  }).catch((err) => {
    res.status(400).send('Invalid Login Credentials')
  })
})

// Logout
app.delete('/users/me/token', authenticate , (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send()
  }, () => {
    res.status(400).send()
  })
})

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})

module.exports = {app}

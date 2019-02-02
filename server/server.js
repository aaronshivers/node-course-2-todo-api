require('./config/config')

const _ = require('lodash')
const express = require('express')
const helmet = require('helmet')
const cookieParser = require('cookie-parser')

const {ObjectId} = require('mongodb')
const {mongoose} = require('./db/mongoose')
const {Todo} = require('./models/todo')
const {User} = require('./models/user')
const {authenticate} = require('./middleware/authenticate')

const app = express()
const port = process.env.PORT

// App Config
app.use(helmet())
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
app.post('/todos', authenticate, async (req, res) => {
  const todo = new Todo({ text: req.body.text, _creator: req.user._id })

  try {
    const doc = await todo.save()
    res.send(doc)
  } catch (error) {
    res.status(400).send(error)
  }
})

// Get all Todos
app.get('/todos', authenticate, async (req, res) => {
  try {
    const todos = await Todo.find({ _creator: req.user._id })
    res.send({todos})
  } catch (error) {
    res.status(400).send(error)
  }
})

// Get Todo by Id
app.get('/todos/:id', authenticate, async (req, res) => {
  const id = req.params.id

  if (!ObjectId.isValid(id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  try {
    const todo = await Todo.findOne({ _id: id, _creator: req.user._id })
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({ todo })
  } catch (error) {
    res.status(400).send('Database Error')
  }
})

// Delete Todo by Id
app.delete('/todos/:id', authenticate, async (req, res) => {
    const id = req.params.id
    if (!ObjectId.isValid(id)) {
      return res.status(404).send('Invalid ObjectId')
    }

  try {
    const todo = await Todo.findOneAndRemove({ _id: id, _creator: req.user._id })
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({ todo })
  } catch (error) {
    res.status(400).send('Database Error')
  }
})

// Patch Todo
app.patch('/todos/:id', authenticate, async (req, res) => {
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

  try {
    const todo = await Todo.findOneAndUpdate({
      _id: id,
      _creator: req.user._id
    }, {$set: body}, {new: true})
    if (!todo) {
      return res.status(404).send('Todo not found')
    }

    res.send({todo})
  } catch (error) {
    res.status(400).send('Database Error')
  }
})

// POST /users
app.post('/users', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password'])
    const user = new User(body)
    await user.save()
    const token = await user.generateAuthToken()
    res.cookie('token', token).send(user)
  } catch (error) {
    res.status(400).send(error)
  }
})

// Private route
app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// POST /users/login
app.post('/users/login', async (req, res) => {
  try {
    const body = _.pick(req.body, ['email', 'password'])
    const user = await User.findByCredentials(body.email, body.password)
    const token = await user.generateAuthToken()
    res.cookie('token', token).send(user)
  } catch (error) {
    res.status(400).send('Invalid Login Credentials')
  }
})

// Logout
app.delete('/users/me/token', authenticate, async (req, res) => {
  try {
    await req.user.removeToken(req.token)
    res.status(200).send()
  } catch(err) {
    res.status(400).send()
  }
})

// Start Server
app.listen(port, () => {
  console.log(`Server listening on port ${port}.`)
})

module.exports = {app}

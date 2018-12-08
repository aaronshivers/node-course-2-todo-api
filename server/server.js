require('dotenv').config()

const	express = require('express')

const {ObjectId} = require('mongodb')
const	{mongoose} = require('./db/mongoose')
const	{Todo} = require('./models/todo')
const	{User} = require('./models/user')

const	app = express()	
const	port = process.env.PORT || 3000

// App Config
app.use(express.json())

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

// Start Server
app.listen(port, () => {
	console.log(`Server listening on port ${port}.`)
})

module.exports = {app}
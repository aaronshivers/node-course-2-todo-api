require('dotenv').config()

const	express = require('express')
const	app = express()

const {ObjectId} = require('mongodb')
const	{mongoose} = require('./db/mongoose')
const	{Todo} = require('./models/todo')
const	{User} = require('./models/user')
			
const	port = process.env.port || 3000

// App Config
app.use(express.json())


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

app.get('/todos', (req, res) => {
	Todo.find().then((todos) => {
		res.send({todos})
	}, (err) => {
		res.status(400).send(err)
	})
})

app.get('/todos/:id', (req, res) => {
	const id = req.params.id

	if (!ObjectId.isValid(id)) {
		return res.status(404).send('Invalid ObjectId')
	}
	Todo.findById(id).then((todo) => {
		if (!todo) {
			return res.status(404).send('Todo not found.')
		}
		res.send({todo})
	}).catch((err) => {
		res.status(400).send('Error connecting to database.')
	})
})

app.listen(port, () => {
	console.log(`Server listening on port ${port}.`)
})

module.exports = {app}
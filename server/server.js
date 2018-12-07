require('dotenv').config()

const	express			= require('express'),

			app			 		= express(),

			{mongoose} 	= require('./db/mongoose'),
			{Todo}  	 	= require('./models/todo'),
			{User} 	 		= require('./models/user'),
			
			port				= process.env.port || 3000

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



app.listen(port, () => {
	console.log(`Server listening on port ${port}.`)
})

module.exports = {app}
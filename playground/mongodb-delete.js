const {MongoClient, ObjectId} = require('mongodb')

MongoClient.connect('mongodb://localhost:27017/TodoApp', { useNewUrlParser: true }, (err, client) => {
	if (err) {
		return console.log('Unable to connect to MongoDB server.')
	}
	console.log('Connected to MongoDB server.')
	const db = client.db('TodoApp')

	// deleteMany
	// db.collection('Todos').deleteMany({text: 'Eat lunch'}).then((result) => {
	// 	console.log(result)
	// })

	// deleteOne
	// db.collection('Todos').deleteOne({text: 'Eat lunch'}).then((result) => {
	// 	console.log(result)
	// })

	// findOneAndDelete
	// db.collection('Todos').findOneAndDelete({completed: false}).then((result) => {
	// 	console.log(result)
	// })

	// deleteMany
	// db.collection('Users').deleteMany({name: 'Beavis'}).then((result) => {
	// 	console.log(result)
	// })

	// findOneAndDelete
	// db.collection('Users').findOneAndDelete({_id: 123}).then((result) => {
	// 	console.log(result)
	// })

	// findOneAndDelete
	// db.collection('Users').findOneAndDelete({_id: new ObjectId('5b8fdaf428060a1482af11d2')}).then((result) => {
	// 	console.log(result)
	// })


	// client.close()
})
const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient

const server = process.env.MONGO_SERVER
const database = process.env.MONGO_DATABASE
const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS
const encodedpass = encodeURIComponent(pass)
const url = `mongodb://${user}:${encodedpass}@${server}/${database}`

mongoose.set('useNewUrlParser', true)
mongoose.set('useFindAndModify', false)
mongoose.set('useCreateIndex', true)

mongoose.connect(url)

module.exports = { mongoose }

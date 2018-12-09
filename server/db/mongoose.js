const mongoose = require('mongoose')
const MongoClient = require('mongodb').MongoClient

const server = process.env.MONGO_DB_SERVER
const database = process.env.MONGO_DB
const user = process.env.MONGO_USER
const pass = process.env.MONGO_PASS
const encodedpass = encodeURIComponent(pass)
const url = `mongodb://${user}:${encodedpass}@${server}/${database}`

mongoose.connect(url, {useNewUrlParser: true})

module.exports = { mongoose }

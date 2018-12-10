const env = process.env.NODE_ENV || 'development'

console.log('env *****', env)
if (env === 'development') {
  process.env.PORT = 3000
  process.env.MONGO_DB = process.env.MONGO_DATABASE
  process.env.MONGO_DB_SERVER = process.env.MONGO_SERVER
} else if (env === 'test') {
  process.env.port = 3000
  process.env.MONGO_DB = process.env.MONGO_DATABASE_TEST
  process.env.MONGO_DB_SERVER = process.env.MONGO_SERVER_TEST
}
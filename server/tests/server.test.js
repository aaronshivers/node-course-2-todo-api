const expect = require('expect')
const request = require('supertest')
const {ObjectId} = require('mongodb')

const {app} = require('./../server')
const {Todo} = require('./../models/todo')
const {User} = require('./../models/user')
const {todos, populateTodos, users, populateUsers} = require('./seed/seed')

beforeEach(populateUsers)
beforeEach(populateTodos)

// POST new Todo
describe('POST /todos', () => {
  it('should create a new todo', (done) => {
    const text = 'Test todo text'
    const cookie = `token=${users[0].tokens[0].token}`

    request(app)
      .post('/todos')
      .set('Cookie', cookie)
      .send({ text })
      .expect(200)
      .expect((res) => {
        expect(res.body.text).toBe(text)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find({text}).then((todos) => {
          expect(todos.length).toBe(1)
          expect(todos[0].text).toBe(text)
          done()
        }).catch((err) => done(err))
      })
  })

  it('should not create todo with invalid body data', (done) => {
    const cookie = `token=${users[0].tokens[0].token}`

    request(app)
      .post('/todos')
      .set('Cookie', cookie)
      .send({})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.find().then((todos) => {
          expect(todos.length).toBe(2)
          done()
        }).catch((err) => done(err))
      })
  })
})

// GET all todos
describe('GET /todos', () => {
  it('should get all todos', (done) => {
    const cookie = `token=${users[0].tokens[0].token}`

    request(app)
      .get('/todos')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(1)
      })
      .end(done)
  })
})

// GET todo by Id
describe('GET /todos/:id', () => {
  const cookie = `token=${users[0].tokens[0].token}`

  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should not return todo doc created by other user', (done) => {
    request(app)
      .get(`/todos/${todos[1]._id.toHexString()}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectId().toHexString()
    request(app)
      .get(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object Ids', (done) => {
    request(app)
      .get('/todos/fakeId')
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// Delete by Id
describe('DELETE /todos/:id', () => {
  const cookie = `token=${users[1].tokens[0].token}`
  
  it('should remove a todo', (done) => {
    const hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo._id).toBe(hexId)
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeFalsy()
          done()
        }).catch((err) => done(err))
      })
  })

  it('should not remove a todo if created by other user', (done) => {
    const hexId = todos[0]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        Todo.findById(hexId).then((todo) => {
          expect(todo).toBeTruthy()
          done()
        }).catch((err) => done(err))
      })
  })

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete('/todos/fakeId')
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })

  it('should return 404 if ObjectId is invalid', (done) => {
    request(app)
      .delete('/todos/fakeId')
      .set('Cookie', cookie)
      .expect(404)
      .end(done)
  })
})

// Patch Todo
describe('PATCH /todos/:id', () => {
  const cookie = `token=${users[0].tokens[0].token}`

  it('should update the todo', (done) => {
    const hexId = todos[0]._id.toHexString()
    const text = 'first updated todo'

    request(app)
      .patch(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .send({
        completed: true,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(true)
        expect(typeof Date.parse(res.body.todo.completedAt)).toBe('number')
      })
      .end(done)
  })

  it('should not update the todo, if created by other user', (done) => {
    const hexId = todos[1]._id.toHexString()
    const text = 'first updated todo'

    request(app)
      .patch(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .send({
        completed: true,
        text
      })
      .expect(404)
      .end(done)
  })

  it('should clear completedAt when todo is incomplete', (done) => {
    const hexId = todos[0]._id.toHexString()
    const text = 'second updated todo'

    request(app)
      .patch(`/todos/${hexId}`)
      .set('Cookie', cookie)
      .send({
        completed: false,
        text
      })
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(text)
        expect(res.body.todo.completed).toBe(false)
        expect(res.body.todo.completedAt).toBeFalsy()
      })
      .end(done)
  })
})

// return authenticated user
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    const cookie = `token=${users[0].tokens[0].token}`


    request(app)
      .get('/users/me')
      .set('Cookie', cookie)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString())
        expect(res.body.email).toBe(users[0].email)
      })
      .end(done)
  })

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({})
      })
      .end(done)
  })
})

// GET users
describe('POST /users', () => {
  it('should create a user', (done) => {
    const email = 'test@example.com'
    const password = '1234asdf'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.header['set-cookie'][0]).toMatch(/token/)
        expect(res.body._id).toBeTruthy()
        expect(res.body.email).toBe(email)
      })
      .end((err) => {
        if (err) {
          return done(err)
        }

        User.findOne({email}).then((user) => {
          expect(user).toBeTruthy()
          expect(user.password).not.toBe(password)
          done()
        }).catch((err) => done(err))
      })
  })

  it('should return validation errors if request is invalid', (done) => {
    const email = 'bad.email*adress'
    const password = '2'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  })

  it('should not create user if email is in use', (done) => {
    const email = 'testuser1@test.com'
    const password = 'password234'

    request(app)
      .post('/users')
      .send({email, password})
      .expect(400)
      .end(done)
  })
})

// POST /users/login
describe('POST /users/login', () => {
  const email = users[1].email
  const password = users[1].password

  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.header).toHaveProperty('set-cookie')
      })
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[0]).toHaveProperty('access', 'auth')
          expect(user.tokens[1]).toHaveProperty('token')
          done()
        }).catch((err) => done(err))
      })
  })

  it('should reject invalid login', (done) => {
    const email = users[1].email
    const password = users[1].email + '1'

    request(app)
      .post('/users/login')
      .send({email, password})
      .expect(400)
      .expect((res) => {
        expect(res.header).not.toHaveProperty('set-cookie')
      })
      // .end(done)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findOne({email: 'testuser2@test.com'}).then((user) => {
          expect(user.tokens.length).toBe(1)
          done()
        }).catch((err) => done(err))
      })
  })
})

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    const cookie = `token=${users[0].tokens[0].token}`
    request(app)
      .delete('/users/me/token')
      .set('Cookie', cookie)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err)
        }

        User.findOne({email: 'testuser1@test.com'}).then((user) => {
          expect(user.tokens.length).toBe(0)
          done()
        }).catch((err) => done(err))
      })
  })
})




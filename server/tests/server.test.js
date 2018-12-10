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

    request(app)
      .post('/todos')
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

    request(app)
      .post('/todos')
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
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(2)
      })
      .end(done)
  })
})

// GET todo by Id
describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text)
      })
      .end(done)
  })

  it('should return 404 if todo not found', (done) => {
    const hexId = new ObjectId().toHexString()

    request(app)
      .get(`/todos/${hexId}`)
      .expect(404)
      .end(done)
  })

  it('should return 404 for non-object Ids', (done) => {
    request(app)
      .get('/todos/fakeId')
      .expect(404)
      .end(done)
  })
})

// Delete by Id
describe('DELETE /todos/:id', () => {
  it('should remove a todo', (done) => {
    const hexId = todos[1]._id.toHexString()

    request(app)
      .delete(`/todos/${hexId}`)
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

  it('should return 404 if todo not found', (done) => {
    request(app)
      .delete('/todos/fakeId')
      .expect(404)
      .end(done)
  })

  it('should return 404 if ObjectId is invalid', (done) => {
    request(app)
      .delete('/todos/fakeId')
      .expect(404)
      .end(done)
  })
})

// Patch Todo
describe('PATCH /todos/:id', () => {
  it('should update the todo', (done) => {
    const hexId = todos[0]._id.toHexString()
    const text = 'first updated todo'

    request(app)
      .patch(`/todos/${hexId}`)
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

  it('should clear completedAt when todo is incomplete', (done) => {
    const hexId = todos[1]._id.toHexString()
    const text = 'second updated todo'

    request(app)
      .patch(`/todos/${hexId}`)
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
    request(app)
      .get('/users/me')
      .set('Cookie', `token=${users[0].tokens[0].token}`)
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
        })
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
const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');
const { User } = require('./../models/user');
const { dummyTodos, populateTodos, dummyUsers, populateUsers } = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', (done) => {
        var text = 'Test todo text';
        
        request(app)
            .post('/todos')
            .send({text})
            .expect(200)
            .expect(res => {
                expect(res.body.text).toBe(text);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({text}).then(todos => {
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should not create a new todo with invalid body data', (done) => {
        request(app)
            .post('/todos')
            .send({})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find().then(todos => {
                    expect(todos.length).toBe(dummyTodos.length);
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('GET /todos', () => {
    it('should get all todos', (done) => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.length).toBe(dummyTodos.length);
            })
            .end(done);
    });
});

describe('GET /todos/:id', () => {
    it('should get todo by id', (done) => {
        request(app)
            .get(`/todos/${dummyTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(dummyTodos[0].text);
            })
            .end(done);
    });

    it('should return 404 if todo not found', (done) => {
        const nonExistentId = (new ObjectID()).toHexString();

        request(app)
            .get(`/todos/${nonExistentId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        const wrongObjectId = '123';
        
        request(app)
            .get(`/todos/${wrongObjectId}`)
            .expect(404)
            .end(done);
    });
});

describe('DELETE /todos/:id', () => {
    it('should remove a todo', (done) => {
        const id = dummyTodos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${id}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(id);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id).then(res => {
                    expect(res).toBeFalsy();
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return 404 if todo not found', (done) => {
        const nonExistentId = (new ObjectID()).toHexString();
        
        request(app)
            .delete(`/todos/${nonExistentId}`)
            .expect(404)
            .end(done);
    });

    it('should return 404 for non-object id', (done) => {
        const wrongObjectId = '123';
        
        request(app)
            .delete(`/todos/${wrongObjectId}`)
            .expect(404)
            .end(done);
    });
});

describe('PATCH /todos/:id', () => {
    it('should update the todo', (done) => {
        const id = dummyTodos[0]._id.toHexString();
        const text = 'This should be the new text';

        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed: true,
                text
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(text);
                expect(res.body.todo.completed).toBe(true);
            })
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done) => {
        const id = dummyTodos[1]._id.toHexString();
        const completed = false;

        request(app)
            .patch(`/todos/${id}`)
            .send({
                completed
            })
            .expect(200)
            .expect(res => {
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end(done);
    });
});

describe('GET /users/me', () => {
    it('should return user if authenticated', (done) => {
        request(app)
            .get('/users/me')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .expect((res) => {
                expect(res.body._id).toBe(dummyUsers[0]._id.toHexString());
                expect(res.body.email).toBe(dummyUsers[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', (done) => {
        request(app)
            .get('/users/me')
            .expect(401)
            .end(done);
    });
});

describe('POST /users', () => {
    it('should create a user', (done) => {
        const email = 'example@example.com';
        const password = '123mnb!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((res) => {
                // expect(res.headers['x-auth']).toExist();
                // expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findOne({email}).then(user => {
                    // expect(user).toExist();
                    // expect(user.password).toNotBe(password);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should return validation errors if request invalid', (done) => {
        request(app)
            .post('/users')
            .send({
                email: 'invalidemail.com',
                password: 'short'
            })
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', (done) => {
        request(app)
            .post('/users')
            .send({
                email: dummyUsers[0].email,
                password: '123asd'
            })
            .expect(400)
            .end(done);
    });
});

describe('POST /users/login', () => {
    it('should login user and return auth token', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].email,
                password: dummyUsers[1].password
            })
            .expect(200)
            .expect(res => {
                // expect(res.headers['x-auth']).toExist();
            })
            .end((err) => {
                if (err) {
                    return done(err);
                }

                User.findById(dummyUsers[1]._id).then(user => {
                    // expect(user.tokens[0]).toInclude({
                    //     access: 'auth',
                    //     token: res.headers['x-auth']
                    // });
                    done();
                }).catch(err => done(err));
            });
    });

    it('should reject invalid login', (done) => {
        request(app)
            .post('/users/login')
            .send({
                email: dummyUsers[1].password,
                password: 'wrongpassword'
            })
            .expect(400)
            .expect(res => {
                // expect(res.body).toBeEqual({});
            })
            .end(err => {
                if (err) {
                    return done(err);
                }

                User.findById(dummyUsers[1]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            });
    });
});

describe('DELETE /users/me/token', () => {
    it('should remove auth token on logout', (done) => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', dummyUsers[0].tokens[0].token)
            .expect(200)
            .end(err => {
                if (err) {
                    return done(err);
                }

                User.findById(dummyUsers[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch(err => done(err));
            });
    });
});
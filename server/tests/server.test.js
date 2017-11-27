const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { app } = require('./../server');
const { Todo } = require('./../models/todo');

const dummyTodos = [{
    _id: new ObjectID(),
    text: 'First test todo'
},{
    _id: new ObjectID(),
    text: 'Second test todo'
}, {
    _id: new ObjectID(),
    text: 'Third test todo'
}];

beforeEach(done => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(dummyTodos);
    }).then(() => done());
});

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
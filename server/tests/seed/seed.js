const { ObjectID } = require('mongodb');
const jwt = require('jsonwebtoken');

const { Todo } = require('./../../models/todo');
const { User } = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const dummyUsers = [{
    _id: userOneId,
    email: 'attila1@example.com',
    password: 'attila1pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userOneId, access: 'auth'}, 'secret123').toString()
    }]
}, {
    _id: userTwoId,
    email: 'attila2@example.com',
    password: 'attila2pass',
    tokens: [{
        access: 'auth',
        token: jwt.sign({_id: userTwoId, access: 'auth'}, 'secret123').toString()
    }]
}];

const dummyTodos = [{
    _id: new ObjectID(),
    text: 'First test todo',
    _creator: userOneId
}, {
    _id: new ObjectID(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
}, {
    _id: new ObjectID(),
    text: 'Third test todo',
    _creator: userOneId
}];

const populateTodos = (done) => {
    Todo.remove({}).then(() => {
        return Todo.insertMany(dummyTodos);
    }).then(() => done());
};

const populateUsers = (done) => {
    User.remove({}).then(() => {
        var userOne = new User(dummyUsers[0]).save();
        var userTwo = new User(dummyUsers[1]).save();

        return Promise.all([userOne, userTwo]);
    }).then(() => done());
};

module.exports = {
    dummyTodos,
    populateTodos,
    dummyUsers,
    populateUsers
}
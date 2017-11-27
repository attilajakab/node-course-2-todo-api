const express = require('express');
const bodyParser = require('body-parser');

const { mongoose } = require('./db/mongoose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    var todo = new Todo(req.body);

    todo.save().then((doc) => {
        res.send(doc);
    }, err => res.status(400).send(e));
});

app.get('/todos', (req, res) => {
    Todo.find().then((todos) => {
        res.send(todos);
    }, err => res.status(400).send(e));
});

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

module.exports = {
    app
};
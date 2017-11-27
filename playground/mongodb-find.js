// const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, db) => {
    if (err) {
        return console.log('Unable to connect to MongoDB server');
    }
    
    console.log('Connected to MongoDB server');

    var id = '5a1bd62dc851c59d95cd93cc';

    if (!ObjectID.isValid(id)) {
        // @TODO
        // Handle invalid id.
    }

    // db.collection('Todos').find({
    //     _id: new ObjectID(id)
    // }).toArray().then((docs) => {
    //     console.log('Todos');
    //     console.log(JSON.stringify(docs, undefined, 2));
    // }, (err) => {
    //     console.log('Unable to fetch todos', err);
    // });

    db.collection('Todos').find().count().then((count) => {
        console.log(`Todos ${count}`);
    }, (err) => {
        console.log('Unable to fetch todos', err);
    });

    // db.close();
});
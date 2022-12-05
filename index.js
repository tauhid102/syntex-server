const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://syntex:QnwAXJ3Rs348IYrA@cluster0.jfvuq.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const database = client.db("syntex");
        const contentCollection = database.collection("content");
        const usersCollection = database.collection("users");

        app.post('/content', async (req, res) => {
            const cursor = req.body;
            const result = await contentCollection.insertOne(cursor);
            res.send(result);
        });
        app.get("/content/contentCollection", async (req, res) => {
            const cursor = contentCollection.find({});
            const page = parseInt(req.query.page);
            let books;
            const count = await cursor.count();
            if (page >= 0) {
                books = await cursor
                    .skip(page * 8)
                    .limit(8)
                    .toArray();
            } else {
                books = await cursor.toArray();
            }
            res.send({
                count,
                books,
            });
        });
        app.get('/user', async (req, res) => {
            const users = await usersCollection.find().toArray();
            res.send(users);
        })
        app.put('/user/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.send(result);
        })
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        //find admin role
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user?.role === 'admin';
            res.send({ admin: isAdmin });
        });


    }
    finally {

    }
}
run().catch(console.dir)
app.get('/', (req, res) => {
    res.send("Running Server")
});
app.listen(port, () => {
    console.log('Server Runningng');
})
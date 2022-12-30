const { MongoClient, ServerApiVersion } = require('mongodb');
const express = require('express');
const ObjectId = require('mongodb').ObjectId;
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
        const contentCollection = database.collection("canteenMenu");
        const usersCollection = database.collection("users");
        const purchasedCollection = database.collection("purchased");
        
        //add food Iteam menu
        app.post('/content', async (req, res) => {
            const cursor = req.body;
            const result = await contentCollection.insertOne(cursor);
            res.send(result);
        });
        //return food iteam in my frontend
        app.get('/content', async (req, res) => {
            const cursor = contentCollection.find({});
            const item = await cursor.toArray();
            res.send(item);
        });
        app.get("/content/contentCollection", async (req, res) => {
            const cursor = contentCollection.find({});
            const page = parseInt(req.query.page);
            let menu;
            const count = await cursor.count();
            if (page >= 0) {
                menu = await cursor
                    .skip(page * 8)
                    .limit(8)
                    .toArray();
            } else {
                menu = await cursor.toArray();
            }
            res.send({
                count,
                menu,
            });
        });
        //delete food item
        app.delete('/content/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await contentCollection.deleteOne(query);
            res.json(result);
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
        //make admin using email
        app.put('/user/admin/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updateDoc = {
                $set: { role: 'admin' },
            };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })
        //find admin role for given the dashboard permimssion
        app.get('/admin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await usersCollection.findOne({ email: email });
            const isAdmin = user?.role === 'admin';
            res.send({ admin: isAdmin });
        });
        //save the purchased iteam into the database
        app.post('/purchased', async (req, res) => {
            const cursor = req.body;
            const result = await purchasedCollection.insertOne(cursor);
            res.json(result);
        });
        
        //find order using email
        app.get('/purchased', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = purchasedCollection.find(query);
            const buy = await cursor.toArray();
            res.json(buy);
        });
        //cancel order
        app.delete('/purchased/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await purchasedCollection.deleteOne(query);
            res.json(result);
        });
        //find all the order
        app.get('/purchased/allorder', async (req, res) => {
            const cursor = purchasedCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });
        //confirmed order
        app.put('/purchased/:id',async(req,res)=>{
            const id = req.params.id;
            console.log(id);
            const query = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                  "status": "Shipped"
                },
              };
            const result=await purchasedCollection.updateOne(query,updateDoc);
            res.json(result);
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
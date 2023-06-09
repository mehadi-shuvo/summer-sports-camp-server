const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

require('dotenv').config();
const app = express();
const port = process.env.PORT || 3000;

//middle wire 
app.use(cors())
app.use(express.json())


//==================================
//        MONGODB
//=================================


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_KEY}@cluster0.ih5yxul.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const userCollection = client.db('summerCamp').collection('users');

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    //jwt token collect;
    app.post('/jwt', (req, res)=>{
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_USER_TOKEN, { expiresIn: '2h' });
      res.send({token})
    })

    //user collection;
    app.get('/users', async (req, res) => {
        const result = await userCollection.find().toArray()
        res.send(result);
      })

    app.post('/users', async (req, res)=>{
        const newUser = req.body;
        const result = await userCollection.insertOne(newUser);
        res.send(result);
    })

    app.patch('/users/admin/:id', async (req, res)=>{
      const id = req.params.id;
      const filter = {_id : new ObjectId(id)}
      const updateDoc ={
        $set:{
          role: 'admin'
        },
      };

      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);

    })





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


//***   BASIC SETUP    ***//

app.get('/', (req, res) => {
    res.send('camp is running')
  })
  
  app.listen(port, () => {
    console.log(`camp server is running on ${port}`);
  })
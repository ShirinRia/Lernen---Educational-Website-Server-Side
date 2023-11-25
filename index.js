const {
  MongoClient,
  ServerApiVersion,
  ObjectId
} = require('mongodb');
// var jwt = require('jsonwebtoken');
const express = require('express')
var cors = require('cors')
require('dotenv').config()
var app = express()
var cookieParser = require('cookie-parser')
// app.use(cors())
app.use(cors({
    origin: ['http://localhost:5173'],
    credentials: true

  }

))
app.use(express.json())
app.use(cookieParser())
const port = process.env.PORT || 5000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

USERNAME = process.env.S3_BUCKET
PASS = process.env.SECRET_KEY
const uri = `mongodb+srv://${USERNAME}:${PASS}@cluster0.xrp2z6o.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const usercollection = client.db("lernen").collection("userdata");


    // add new user to database
    app.post('/users', async (req, res) => {
      const user = req.body
      console.log(user)
      const result = await usercollection.insertOne(user);
      res.send(result)
    })


    // update userdata
    app.patch('/users', async (req, res) => {

      const user = req.body
      const query = {
        email: user.email
      }

      const updateuserdb = {
        $set: {
          lastloggedat: user.lastloggedat
        },
      };
      // Update the first document that matches the filter
      const result = await usercollection.updateOne(query, updateuserdb);
      res.send(result)
    })

    // add class
    app.post('/classes', async (req, res) => {
      const classes = req.body
      console.log(classes)
      const result = await classescollection.insertOne(classes);
      res.send(result)
    })
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`App listening on port ${port}`)
})
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
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
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
    const classescollection = client.db("lernen").collection("classesdata");
    const instructorcollection = client.db("lernen").collection("instructordata");
    const payment_class_information_collection = client.db("lernen").collection("payment_class_data");
    const assignmentcollection = client.db("lernen").collection("assignmentdata");


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
    // get all class from database
    app.get('/classes', async (req, res) => {

      const cursor = classescollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // get student class from database
    app.get('/studentclasses', async (req, res) => {
      const query = {
        email: req?.query?.email,
      };
      const cursor = payment_class_information_collection.find(query);
      const result = await cursor.toArray();
      const ids = result.map(item => item.courseId);
      console.log(ids);
      const objectids = ids.map(id => new ObjectId(id))

      const filter = {
        _id: {
          $in: objectids
        }
      };

      const resu = await classescollection.find(filter).toArray();
      res.send(resu)
    })
    // get teacher class from database
    app.get('/teacherclasses', async (req, res) => {
      const query = {
        email: req?.query?.email,
      };
      const cursor = classescollection.find(query);
      const result = await cursor.toArray();

      res.send(result)
    })
    // get assignments from database
    app.get('/assignments/:id', async (req, res) => {
      const query = {

        courseid: req.params.id,
      };
      const cursor = assignmentcollection.find(query);
      const result = await cursor.toArray();

      res.send(result)
    })
    // get all class from database
    app.get('/class/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await classescollection.findOne(query);
      res.send(result);
    })

    // get all users from database
    app.get('/users', async (req, res) => {
      const cursor = usercollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // get all instructors from database
    app.get('/instructors', async (req, res) => {
      const cursor = instructorcollection.find();
      const result = await cursor.toArray();
      res.send(result)
    })
    // get user payments from database
    app.get('/payments', async (req, res) => {
      const query = {
        email: req?.query?.email,
      };
      const cursor = payment_class_information_collection.find(query);
      const result = await cursor.toArray();
      res.send(result)
    })
    // add instructor
    app.post('/newinstructor', async (req, res) => {
      const instructor = req.body
      console.log(instructor)
      const result = await instructorcollection.insertOne(instructor);
      res.send(result)
    })
    // add assignment
    app.post('/createassignment', async (req, res) => {
      const assignment = req.body
      console.log(assignment)
      const result = await assignmentcollection.insertOne(assignment);
      res.send(result)
    })
    // paymnet
    app.post('/payments', async (req, res) => {
      const payment = req.body
      console.log(payment)
      const result = await payment_class_information_collection.insertOne(payment);
      res.send(result)
    })
    // payment intent
    app.post('/create-payment-intent', async (req, res) => {
      const {
        price
      } = req.body;
      const amount = parseInt(price * 100);
      console.log(amount, 'amount inside the intent')

      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
      });

      res.send({
        clientSecret: paymentIntent.client_secret
      })
    });
    // update course
    app.put('/updatecourse', async (req, res) => {

      let query = {}
      if (req.query?.id) {
        query = {
          _id: new ObjectId(req.query.id)
        }
      }

      const options = {
        upsert: true
      };

      const updateproduct = req.body
      // console.log(updateproduct)
      const updateproductdoc = {
        $set: {


          title: updateproduct.title,
          name: updateproduct.name,
          email: updateproduct.email,
          price: updateproduct.price,
          description: updateproduct.description,
          photo: updateproduct.photo

        },
      };

      // Update the first document that matches the filter
      const result = await classescollection.updateOne(query, updateproductdoc, options);
      res.send(result)
    })
    app.delete('/class/:id', async (req, res) => {
      const id = req.params.id;
      const query = {
        _id: new ObjectId(id)
      }
      const result = await classescollection.deleteOne(query);
      res.send(result);
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
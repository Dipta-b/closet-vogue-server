const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();


const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvi03.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const closetCollection = client.db('closetWebsite').collection('closets');
    //post request to add closet
app.post("/closets",async(req,res)=>{
    const closet = req.body;
    const result = await closetCollection.insertOne(closet);
    res.send(result);
})

app.get("/closets",async(req,res)=>{
    const limit = parseInt(req.query.limit);
    const cursor = closetCollection.find();
    if(limit){
        const result = await cursor.limit(limit).toArray();
        res.send(result);
    }
    else{
        const result = await cursor.toArray();
        res.send(result);
    }
})





  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Server is for closet vogue Dipta');
})

app.listen(port, () => {
    console.log(`lsitening on port ${port}`)
})
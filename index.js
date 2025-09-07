const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
require('dotenv').config();


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qvi03.mongodb.net/closetWebsite?retryWrites=true&w=majority`;

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
    app.post("/closets", async (req, res) => {
      const closet = req.body;
      const result = await closetCollection.insertOne(closet);
      res.send(result);
    })

    app.get("/closets", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const cursor = closetCollection.find();
      if (limit) {
        const result = await cursor.limit(limit).toArray();
        res.send(result);
      }
      else {
        const result = await cursor.toArray();
        res.send(result);
      }
    })

    app.get("/closets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await closetCollection.findOne(query);
      res.send(result);
    })


    app.delete("/closets/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      res.send(await closetCollection.deleteOne(query));
    })

    app.put("/closets/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const product = req.body
      const updatedCloset = {
        $set: {
          name: product.name,
          category: product.category,
          subCategory: product.subCategory,
          gender: product.gender,
          price: product.price,
          sizes: product.sizes,
          color: product.color,
          shortDescription: product.shortDescription,
          description: product.description,
          imageUrl: product.imageUrl,
          productDetails: product.productDetails,
        }
      }
      const result = await closetCollection.updateOne(filter, updatedCloset, options)
      res.send(result);
    })

    // filter by category
    app.get("/closets/category/:category", async (req, res) => {
      const category = req.params.category;
      let result;

      if (category === "allproducts") {
        result = await closetCollection.find().toArray();
      }
      else {
        result = await closetCollection.find({
          category: { $regex: `^${category}$`, $options: "i" }
        }).toArray();
      }
      res.send(result);
    })

    //Add to cart API
    app.post("/products/cart", async (req, res) => {
      const product = req.body;
      const result = await closetCollection.insertOne(product);
      res.send(result);
    })

    //get products by email
    app.get("/products/cart", async (req, res) => {
      const email = req.query.email;
      const query = { email: email };
      const result = await closetCollection.find(query).toArray();
      res.send(result);
    })


    // Update product quantity in cart
    // Update quantity
    app.patch("/products/cart/:id", async (req, res) => {
      const id = req.params.id;
      const { qty } = req.body;

      if (qty < 1) return res.status(400).send({ error: "Quantity must be at least 1" });

      try {
        const result = await closetCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { quantity: qty } }
        );
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to update quantity" });
      }
    });

    // Remove product from cart
    app.delete("/products/cart/:id", async (req, res) => {
      const id = req.params.id;

      try {
        const result = await closetCollection.deleteOne({ _id: new ObjectId(id) });
        res.send(result);
      } catch (err) {
        res.status(500).send({ error: "Failed to remove item" });
      }
    });



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
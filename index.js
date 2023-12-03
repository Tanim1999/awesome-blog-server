const express = require('express');
const app = express();
const cors = require('cors');

require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
app.use(express.json())





const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pxdxtq4.mongodb.net/?retryWrites=true&w=majority`;

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

    const blogCollection = client.db("Awesome-BlogDb").collection("blogs");

    //blogs related api
    app.post('/blogs', async (req, res) => {
        const blog = req.body;
        const result = await blogCollection.insertOne(blog);
        res.send(result);
        console.log(result)
    });

    app.get('/blogs', async (req, res) => {
        try {
            const filter = req.query;
            const email = req.query.email

            const category = req.query.category
            const id= req.query._id
           

            const query = {}

            if (req.query.search) {
                query.title = { "$regex": filter.search, "$options": "i" }

            }
            if (email) {
                query.email = email
            }


            if (category) {
                query.category = category
            }
            if (id) {
                query._id = id
            }
            

            const cursor = blogCollection.find(query);
            const result = await cursor.toArray();
            res.send(result);
        } catch (error) {
            console.error('Error fetching assets:', error);
            res.status(500).send('Internal Server Error');
        }
    });
      
    app.get('/blogs/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await blogCollection.findOne(query);
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


app.get('/',(req,res)=>{
    res.send('awesome blog in running') 

})
app.listen(port, () => {
    console.log(`awesome-blog is running on port ${port}`);
})


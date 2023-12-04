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
        const commentCollection = client.db("Awesome-BlogDb").collection("comments");
        const wishlistCollection = client.db("Awesome-BlogDb").collection("wishlists");

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
                const id = req.query._id


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

        app.patch('/blogs/:id', async (req, res) => {
            const blog = req.body;
            const id = req.params.id;
            const options = { upsert: true };
            const filter = { _id: new ObjectId(id) }
            const updatedDoc = {
                $set: {
                   
                    title:  blog.title,
                    imageURL: blog.imageURL,
                    category:  blog.category,
                    shortDescription:  blog.shortDescription,
                    longDescription: blog.longDescription,

                }
            }

            const result = await blogCollection.updateOne(filter, updatedDoc, options)
            res.send(result);
        })


        // comments related api
        app.post('/comments', async (req, res) => {
            const comment = req.body;
            const result = await commentCollection.insertOne(comment);
            res.send(result);
            console.log(result)
        });

        app.get('/comments', async (req, res) => {
            try {

                const commentId = req.query.commentId


                const query = {}


                if (commentId) {
                    query.commentId = commentId
                }


                const cursor = commentCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching assets:', error);
                res.status(500).send('Internal Server Error');
            }
        });

        // wishlists related api
        app.post('/wishlists', async (req, res) => {
            const wishlist = req.body;

            const query = { blogId: wishlist.blogId,email:wishlist.email }
            const existingWishlist = await wishlistCollection.findOne(query);
            if (existingWishlist) {
                return res.send({ message: 'Already wishlisted it', insertedId: null })
            }
            const result = await wishlistCollection.insertOne(wishlist);
            res.send(result);
        });

        

        app.get('/wishlists', async (req, res) => {
            try {

                const blogId = req.query.blogId
                const email = req.query.email


                const query = {}


                if (blogId) {
                    query.blogId = blogId
                }
                if (email) {
                    query.email = email
                }


                const cursor = wishlistCollection.find(query);
                const result = await cursor.toArray();
                res.send(result);
            } catch (error) {
                console.error('Error fetching assets:', error);
                res.status(500).send('Internal Server Error');
            }
        });






        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('awesome blog in running')

})
app.listen(port, () => {
    console.log(`awesome-blog is running on port ${port}`);
})


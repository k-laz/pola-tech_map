const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');
require('dotenv').config();
const url = process.env.MONGODB_KEY;

const MongoClient = require("mongodb").MongoClient;                                                                                                         
// const url = "mongodb+srv://Kirill:Dusha200096@clustermap.ra2wf.mongodb.net/map?retryWrites=true&w=majority";

const { json } = require('body-parser');


var PORT = 3000;
app.use(express.static(__dirname));
app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log("server listening on PORT", PORT);
    console.log("http://localhost:3000");
});
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'));
})


// Adding ship's data to the database
app.post('/vessel_data', (req, res) => {
    var vessel = req.body;                           
    async function addToCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            var db = client.db("map");
            var col = db.collection("fleet");

            // Insert a single document, wait for promise so we can read it back
            const p = await col.insertOne(vessel);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    
    addToCollection().catch(console.dir);
    return res.end('done');
});


// removing ship's data from the database
app.post('/vessel_remove_data', (req, res) => {
    var vessel = req.body;                          
    async function removeFromCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            console.log("Connected correctly to server");
            var db = client.db("map");
            var col = db.collection("fleet");

            const p = await col.findOneAndDelete(vessel);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    
    removeFromCollection().catch(console.dir);
    return res.end('done');
});


// Loading ships' data into the map on the server
app.get("/load_map", (req, res) => {
    async function findVessels() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 });
        try {
            await client.connect();
            console.log("Connected correctly to the database for fleet retrieval!");
            // database :
            var db = client.db("map");
            var allVessels = await db.collection("fleet").find().toArray();
            res.json(allVessels);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
        
    findVessels().catch(console.dir);
});


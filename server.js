const express = require('express');
const app = express();
const path = require('path');
var bodyParser = require('body-parser');
// const url = process.env.MONGODB_KEY;
const url = "mongodb+srv://Kirill:Dusha200096@clustermap.ra2wf.mongodb.net/map?retryWrites=true&w=majority"

const MongoClient = require("mongodb").MongoClient;                                                                                                         
const { json } = require('body-parser');


const config = require('./config.js');
console.log(`NODE_ENV=${config.NODE_ENV}`);

// var environment = process.env.NODE_ENV
// var isDevelopment = environment === 'development'

// if (isDevelopment) {
//   setUpMoreVerboseLogging()
// }


const helmet = require('helmet');
app.use(helmet());

app.use(express.static(__dirname));
app.listen(config.PORT || 3000);
    
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.get('/', (req, res) => {
    console.log("connected to server");
    res.sendFile(path.join(__dirname, '/index.html'));
})


// Adding ship's data to the database
app.post('/add_vessel_data', (req, res) => {
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

// Clear the Entire Collection
app.post('/clear_all', (req, res) => {                        
    async function deleteAllInCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            console.log("reached line 55");
            var db = client.db("map");
            await db.collection('fleet').deleteMany({});
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    
    deleteAllInCollection().catch(console.dir);
    return res.end('done');
});


// removing ship's data from the database
app.post('/delete_vessel/:mmsi', (req, res) => {
    var mmsi = req.params.mmsi;                        
    async function removeFromCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            var db = client.db("map");
            // var col = db.collection("fleet").find({"mmsi": mmsi}).limit(1);
            const p = await col.findOneAndDelete(({"mmsi" : mmsi}));
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    
    removeFromCollection().catch(console.dir);
    return res.end('done');
});


// sends all vessel data
app.get("/get_all_data", (req, res) => {
    async function findVessels() {
        console.log("connected");
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 });
        try {
            console.log("connected!!!");
            await client.connect();
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

// sends all vessel data
app.get("/get_all_mmsi", (req, res) => {
    async function findMMMSIs() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 });
        try {
            await client.connect();
            var db = client.db("map");

            var allVessels = await db.collection("fleet").find().toArray();
            res.json(allVessels);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
        
    findMMMSIs().catch(console.dir);
});


// checks whether a document is present in the db
app.get('/exists_in_db/:mmsi', (req, res) => {   
    var mmsi = req.params.mmsi;
    var exists = true;
    async function existsInCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            var db = client.db("map");
            var doc = db.collection("fleet").find({"mmsi": mmsi}).limit(1);
            var count = await doc.count();
            if (count == 0) {
                exists = false;
            }
            res.json({"exists" : exists});
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    existsInCollection().catch(console.dir);
});

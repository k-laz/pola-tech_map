const express = require('express');
const app = express();
const path = require('path');

//======================================
//                  MiddleWare:

var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

app.use(bodyParser.urlencoded({ extended: false}));

app.use(express.static(__dirname + '/public'));

app.use(favicon(path.join(__dirname,'public','favicon.ico')));

const helmet = require('helmet');
app.use(helmet());

app.get("/", (req, res) => {
    res.render('../public/index.html');
})

app.listen(process.env.PORT || 3000); 


//==================================
//      future upgrade to router seperation:

// app.get('/items', getItems);
// app.post('/items', addItem);
// app.put('/items/:id', updateItem);
// app.delete('/items/:id', deleteItem);


//==============================================
//                      DataBase:

const url = "mongodb+srv://Kirill:Dusha200096@clustermap.ra2wf.mongodb.net/map?retryWrites=true&w=majority"
//const url = 'mongodb://172.17.0.3:27017';
//const url = 'mongodb://localhost:27017';
//const url = 'mongodb://Kirill:Dusha200096@host1:8888'
const dbName = "map";

const MongoClient = require("mongodb").MongoClient;                                                                                                         
//const { json } = require('body-parser');


// ==============================================
//                      CSP headers

var cors = require('cors');
// app.use(cors());
app.options('*',cors())
var allowCrossDomain = function(req,res,next) {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE')
    res.header('Access-Control-Allow-Headers', 'Content-Type')
    next();
}

app.use(allowCrossDomain);


//====================================================
//                   Router Functions:

// Adding ship's data to the database
app.post('/add_vessel_data', (req, res) => {
    var vessel = req.body;       
    var feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [vessel.info.LON, vessel.info.LAT]
        },
        "properties": {
            "name": vessel.name,
            "extra": vessel.info
        }
    }                    
    async function addToCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            var db = client.db("map");
            var col = db.collection("geofleet");

            // Insert a single document, wait for promise so we can read it back
            const p = await col.insertOne(feature);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }
    
    addToCollection().catch(console.dir);
    return res.end('done');
});


app.get('/vesselName/mmsi', (req, res) => {
    var mmsi = req.params.mmsi;
    async function getVesselName() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            var db = client.db("map");
            var vessel = db.collection("vesselNames").find({"mmsi": mmsi}).limit(1);
            
            res.json(vessel);
        } catch (err) {
            console.log(err.stack);
        } finally {
            await client.close();
        }
    }

    getVesselName().catch(console.dir);
    return res.end('done');
})

// Clear the Entire Collection
app.delete('/delete_all', (req, res) => {                        
    async function deleteAllInCollection() {
        var client = new MongoClient(url, { useUnifiedTopology: true}, { useNewUrlParser: true }, { connectTimeoutMS: 30000 }, { keepAlive: 1});
        try {
            await client.connect();
            console.log("connected for deleting");
            var db = client.db(dbName);
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
        
    findVessels().catch(console.dir);
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

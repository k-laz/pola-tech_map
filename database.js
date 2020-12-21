const { MongoClient } = require("mongodb");
 
// Replace the following with your Atlas connection string                                                                                                                                        
const url = "mongodb+srv://Kirill:Dusha200096@clustermap.ra2wf.mongodb.net/map?retryWrites=true&w=majority";
const client = new MongoClient(url);

const dbName = "map";

async function addNewCollection() {
    try {
        await client.connect();
        console.log("Connected correctly to server");
        const db = client.db(dbName);

        // Use the collection "fleet"
        const col = db.collection("fleet");

        // Construct a document    
        // I need to somehow get the other fleet, 
        // append new one to it, and post the result into the database
        // Maybe create an edit function that takes care of that.                                                                                                                                                         
        let fleet = {

        }

        // Insert a single document, wait for promise so we can read it back
        const p = await col.insertOne(fleet);
        // Find one document
        const myDoc = await col.findOne();
        // Print to the console
        console.log(myDoc);

    } catch (err) {
        console.log(err.stack);
    }
    finally {
        await client.close();
    }
}

addNewCollection().catch(console.dir);
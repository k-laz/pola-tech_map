require('dotenv').config();
const mongoose = require('mongoose');
const { vesselModel } = require('../Models/Vessel');
const { vesselName } = require('../Models/VesselName');

mongoose.connect("mongodb+srv://Kirill:Dusha200096@clustermap.ra2wf.mongodb.net/map?retryWrites=true&w=majority", {useNewUrlParser: true, useUnifiedTopology: true});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));

db.once('open', function() {
    console.log("Connection Successful!");
}); 


//MAKE SURE YOU UPDATE POTENTIAL DUPLICATES INSTEAD OF DOING NOTHING
async function storeVessel(vessel) {
    vessel.save()
        .then(vessel => {
            console.log(vessel);
        }).catch(err => {
            console.log("saving error : " + err);
        })
};

async function getVessels() {
    const docs = await vesselModel.find({});
    return docs;
};

async function deleteVessel(MMSI) {
    vesselModel.deleteOne({ mmsi: MMSI }, (err) => {
        if (err) console.error(err);
    });
};

async function getVessel(MMSI) {
    const doc = await vesselModel.findOne({ properties: {
        mmsi: MMSI
    }});
    return doc;
};


async function updateVessel(data) {
    
    vesselModel.updateOne({ "properties.mmsi": data.mmsi }, {
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [data.info.LON, data.info.LAT]
        },
        properties: {
            mmsi: data.mmsi,
            name: data.name,
            rotation: data.info.HEADING,
            info: data.info,
        }
    }, function (err, docs) { 
        if (err) { 
            console.log(err) 
        } 
        else { 
            console.log("Updated Docs : ", docs); 
        }
    });
};


async function getVesselName(MMSI) {
    let vessel = await vesselName.findOne({ "mmsi": MMSI });
    if (vessel != null) {
        return vessel.name;
    }
}



module.exports = {
    getVessels,
    updateVessel,
    storeVessel,
    getVessel,
    deleteVessel,
    getVesselName
};
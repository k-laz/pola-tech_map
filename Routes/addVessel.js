const db = require('../Persistence/mongo');
const {vesselModel} = require('../Models/Vessel');

module.exports = async (req, res) => {
    const vessel = new vesselModel({
        type: "Feature",
        geometry: {
            type: "Point",
            coordinates: [req.body.info.LON, req.body.info.LAT]
        },
        properties: {
            mmsi: req.body.mmsi,
            name: req.body.name,
            rotation: req.body.info.HEADING,
            info: req.body.info,
        }
    });

    console.log(req.body.name);

    await db.storeVessel(vessel);
    res.send(vessel);
};




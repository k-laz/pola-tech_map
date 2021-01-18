const db = require('../Persistence/mongo');

module.exports = async (req, res) => {
    var mmsi = req.params.mmsi;
    await db.deleteVessel(mmsi);
    res.send("Done");
};


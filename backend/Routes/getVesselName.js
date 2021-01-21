const db = require('../Persistence/mongo');

module.exports = async (req, res) => {
    var name = await db.getVesselName(req.params.mmsi);
    res.send({ "name": name });
};

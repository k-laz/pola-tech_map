const db = require('../Persistence/mongo');

module.exports = async (req, res) => {
    var vessel = await db.getVessel();
    res.json(vessel);
};

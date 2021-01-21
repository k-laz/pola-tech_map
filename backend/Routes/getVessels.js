const db = require('../Persistence/mongo');

module.exports = async (req, res) => {
    var fleet = await db.getVessels();
    res.json(fleet);
};

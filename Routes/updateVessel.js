const db = require('../Persistence/mongo');

module.exports = async (req, res) => {
    let data = await req.body;
    console.log(req.body.name);
    await db.updateVessel(data)
    res.send('Done');
};



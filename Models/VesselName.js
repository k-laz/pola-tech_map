const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vesselSchema = new Schema({
    mmsi: {type: String, required: true},
    name: {type: String, required: true}
});

module.exports.vesselName = mongoose.model('vesselname', vesselSchema, 'vesselnames');


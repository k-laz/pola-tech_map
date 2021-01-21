const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const vesselSchema = new Schema({
    type: String,
    geometry: Object,
    properties: {
        name: String,
        mmsi: String,
        rotation: Number,
        info: Object
    }
});

module.exports.vesselModel = mongoose.model('vessel', vesselSchema);



// const vesselSchema = new Schema({
//     type: "Feature",
//     geometry: {
//         type: "Point",
//         coordinates: [Number, Number]
//     },
//     properties: {
//         mmsi: Number,
//         name: String,
//         info: Object
//     }
// });
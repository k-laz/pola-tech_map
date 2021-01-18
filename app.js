const express = require('express');
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');

// Import Route Connections:
const getVessels = require('./Routes/getVessels');
const addVessel = require('./Routes/addVessel');
const deleteVessel = require('./Routes/deleteVessel');
const updateVessel = require('./Routes/updateVessel');
const getVessel = require('./Routes/getVessel');
const getVesselName = require('./Routes/getVesselName');


// MiddleWare:
app.use(express.static(path.join(__dirname, 'public')));
app.use(require('body-parser').json());
app.use(cookieParser());

app.get('/fleet', getVessels);
app.get('/fleet/:mmsi', getVessel);
app.get('/fleet/name/:mmsi', getVesselName);
app.post('/fleet', addVessel);
app.put('/fleet', updateVessel);
app.delete('/fleet/:mmsi', deleteVessel);



var CronJob = require('cron').CronJob;
var job = new CronJob('0 7 * * *', function() {
  console.log('A MESSAGE');
}, null, true, 'Europe/Moscow');
job.start();


app.listen(3000, () => console.log('Listening on port 3000'));
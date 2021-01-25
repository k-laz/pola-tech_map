
//                                      MAIN MAP FUNCTION WITH PORTS DATA:

mapboxgl.accessToken = 'pk.eyJ1Ijoia2xheiIsImEiOiJja2h1bGl3dXYyYjB0MzJrNnNxcnBmc3pzIn0.9qgI_dzZzzMnDvPDtWWR6Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [0, 30],
    zoom: 1,
    maxZoom: 15,
});

map.on('load', async () => {

    let fleet_data = await loadFleetData();
    console.log(fleet_data);
    loadDropDown(fleet_data);
    loadMarkers(fleet_data);

    map.loadImage(
      './images/port_icon.png',
        async function (error, image) {
            if (error) throw error;
            map.addImage('port-marker', image);
            map.addSource('ports', {
                type: 'geojson',
                data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
            });

            // Add a symbol(port source) layer
            map.addLayer({
                'id': 'ports',
                'type': 'symbol',
                'source': 'ports',
                'layout': {
                    'icon-image': 'port-marker',
                    'icon-size': 0.10,
                    // get the title name from the source's "title" property
                    'text-field': ['get', 'name'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, .4],
                    'text-anchor': 'top',
                    'text-size': 8
                }
            });
        }
    );

    map.loadImage(
        './images/brownVessel.png',
        async function (error, image) {
            if (error) throw error;
            map.addImage('vessel-marker', image);
            map.addSource('fleet-source', {
                "type": 'geojson',
                "data": fleet_data
            });

            // Add a symbol(port source) layer
            map.addLayer({
                'id': 'fleet',
                'type': 'symbol',
                'source': 'fleet-source', //fleet-source
                'layout': {
                    'icon-image': 'vessel-marker',
                    'icon-allow-overlap': true,
                    'icon-ignore-placement': true,
                    'icon-size': .09,
                    'icon-rotate': {
                        'type': 'identity',
                        'property': 'rotation'
                    },
                    'text-field': ['get', 'name'],
                    'text-font': [
                        'Open Sans Semibold',
                        'Arial Unicode MS Bold'
                    ],
                    'text-offset': [0, 2],
                    'text-anchor': 'top',
                    'text-size': 8
                },
                'paint': {
                    "text-color": "#000000"
                }
            });
        }
    );
});

async function loadFleetData() {
    let response = await fetch('/fleet');

    if (response.ok) {
        let data = await response.json();
        console.log("vessels loaded -> " + data.length);

        geojson = {
            "type": "FeatureCollection",
            "features": data
        }

        return geojson;
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

async function loadMarkers(fleet_data) {
    fleet_data.features.forEach(function(marker) {
        var el = document.createElement('div');
        el.className = 'marker';
        var marker = new mapboxgl.Marker(el)
            .setLngLat(marker.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 15 })
            .setHTML(`<div><h3 style="text-align:left;font-weight: 300;font-size: 18px; color: #0058E3"> ${marker.properties.name} </h3> 
                    <p style="font-size: 12px"> IMO: ${marker.properties.info.IMO} </p> </div>
                    <hr color="gray" width="95%">
                        <p> 
                            MMSI: ${marker.properties.mmsi} </br>
                            COURSE: ${marker.properties.info.COURSE} </br>
                            SPEED: ${marker.properties.info.SPEED} </br>
                            AIS ETA: ${marker.properties.info.ETA} </br>
                            Sailing to: ${marker.properties.info.NEXT_PORT_NAME} </br>
                            Expected ETA: ${marker.properties.info.ETA_CALC}   
                        </p>
                    <hr color="gray" width="95%">`
                    ))
            .addTo(map);
    });
}

{/* <h4 style="text-align:center;font-weight: 500;font-size: 20px; color: #0058E3"> VOYAGE</h4>
Type: ${marker.properties.current_voyage_type} </br>
Charterer ${marker.properties.current_voyage_charterers} </br>
ETCE ${marker.properties.current_voyage_estimated_tce} </br> */}


        

// map.addSource('cl', {
//     "type": "geojson",
//     "data":{
//         "type": "FeatureCollection",
//         "features": 
//     [{
//         'geometry': {
//           "type": "Point",
//           "coordinates": [20, 30]
//         },
//         "properties": {
//           "name": "HANZE",
//           "rotation": 80
//         },
//           'type': 'Feature'
//       },
//       {
//           'geometry': {
//             "type": "Point",
//             "coordinates": [30, 40]
//           },
//           "properties": {
//             "name": "DOT",
//             "info": {
//                 "wahtever": 21287
//             },
//             "rotation": 150
//           },
//             'type': 'Feature'
//       }]}
//   });

// -------------------------------------------------------------
// -------------------------------------------------------------

//                                BUTTONS TO DISABLE LAYERS:

// enumerate ids of the layers
// var toggleableLayerIds = ['ports', 'fleet'];

// for (var i = 0; i < toggleableLayerIds.length; i++) {
//     var id = toggleableLayerIds[i];

//     var link = document.createElement('a');
//     link.href = '#';
//     link.className = 'active';
//     link.textContent = id;

//     link.onclick = function (e) {
//         var clickedLayer = this.textContent;
//         e.preventDefault();
//         e.stopPropagation();

//         var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

//         // toggle layer visibility by changing the layout object's visibility property
//         if (visibility === 'visible') {
//             map.setLayoutProperty(clickedLayer, 'visibility', 'none');
//             this.className = '';
//         } else {
//             this.className = 'active';
//             map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
//         }
//     };

//     var layers = document.getElementById('menu');
//     layers.appendChild(link);
// }


// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
//                                             MISCALLENIOUS:

const ship_dropdown = document.getElementById('ship-list'); 
function refresh() {    
    setTimeout(function () {
        location.reload()
    }, 100);
}

// =============================================================================================
//                                              FRONTEND FUNCTIONALITY:

const MENU = document.getElementById('menu');

var editFleet = document.createElement('a');
editFleet.href = '#';
editFleet.className = 'active';
editFleet.textContent = "EDIT";

var updateBtn = document.createElement('a');
updateBtn.href = '#';
updateBtn.className = 'active';
updateBtn.textContent = 'UPDATE';

MENU.appendChild(editFleet);
MENU.appendChild(updateBtn);



var editFleetForm = document.getElementById("editFleetForm");
const addShipBtn = document.getElementById('addBtn');
const removeShipBtn = document.getElementById('removeBtn');
editFleet.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    if (editFleetForm.style.visibility == 'visible') {
        editFleetForm.style.visibility = 'hidden';
    } else {
        editFleetForm.style.visibility = 'visible';
    }
});

//============================================================================================
//                      UPDATING THE ENTIRE COLLECTION WITH DATA FROM MARINE TRAFFIC

updateBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    updateBtnFunctionality();
});

async function updateBtnFunctionality() {
    updateBtn.textContent = 'UPDATING...'
    await UPDATE_ALL_VESSELS();
    refresh();
}

async function UPDATE_ALL_VESSELS() {
    let allMMSI = await get_all_mmsi();

    if (allMMSI.length > 0) {
        for(let i in allMMSI) {
            let ship_info = await getVesselInfoFromMarineTraffic(allMMSI[i]);
    
            if (ship_info != null) {
                var data = JSON.stringify({"name": ship_info.SHIPNAME, "mmsi": ship_info.MMSI, "info" : ship_info});
    
                putData('/fleet', data).then(res => {
                    console.log(res);
                }).catch(err => {
                    console.error(err);
                });
            } else {
                alert(`Ship information for ship with MMSI: ${allMMSI[i]} is currently unavailable on Marine Traffic`);
            }
        }
    } else {
        alert("There are 0 vessels in the database")
    }
    
}

async function get_all_mmsi() {
    return fetch('/fleet').then( async(response) => {
        if (response.ok) {
            let data = await response.json();
            let arr = [];
            for (vessel in data) {
                arr.push(data[vessel].properties.mmsi);
            }
            return arr;
        }
    }).catch(err => {
        console.error(err);
    })
}


//============================================================================================
//                    GETTING A SINGLE VESSEL INFO FROM MARINE TRAFFIC WITH AN API CALL:

const MarineTrafficAPIkeyIMO = "https://services.marinetraffic.com/api/exportvessel/v:5/7f70cbed5527332c828792c7bce77421dd54fbe8/timespan:2880/msgtype:extended/protocol:jsono/imo:";
const MarineTrafficAPIkeyMMSI = "https://services.marinetraffic.com/api/exportvessel/v:5/7f70cbed5527332c828792c7bce77421dd54fbe8/timespan:2880/msgtype:extended/protocol:jsono/mmsi:";

async function getVesselInfoFromMarineTraffic(mmsi) {

    let response = await fetch(MarineTrafficAPIkeyMMSI + mmsi);
    if (response.ok) {
        let data = await response.json();
        return data[0];
    } else {
        alert("HTTP-Error with Marine Traffic Call : " + response.status);
    }
}

//=============================================================================================
//                                         DROPDOWN MENU FUNCTIONALITY:

const DROPDOWN = document.getElementById('ship-list')
const shipCoordinates = new Map();

function loadDropDown(data) {
    for(let i in data.features) {

        // create and add an option to dropdown
        var vessel = document.createElement('option');
        vessel.value = data.features[i].properties.name;
        vessel.textContent = data.features[i].properties.name;
        DROPDOWN.appendChild(vessel);

        // fill out the coordinates map 
        shipCoordinates.set(data.features[i].properties.name, [data.features[i].properties.info.LON, data.features[i].properties.info.LAT]);
    }
}

DROPDOWN.onchange = () => {
    var name = ship_dropdown.options[ship_dropdown.selectedIndex].value; 
    var coordinates = shipCoordinates.get(name);
    map.jumpTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 8
    });
}


//=============================================================================================
//                                         ADD/REMOVE SHIP FROM DB

function parseInput(text) {
    var lines = text.split("\n");
    return lines;
}


// ===================================================   ADD
addShipBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    addBtnFunctionality();
});
async function addBtnFunctionality() {
    var allMMSI = parseInput(document.getElementById("inputMMSI").value);
    console.log("MMSI input for addition: " + allMMSI);
    editFleetForm.style.visibility = 'hidden';

    for (let i in allMMSI) {
        let vesselName = await get_vessel_name(allMMSI[i]);

        if (allMMSI[i] != "") {
            await addShipToDB(allMMSI[i], vesselName);
        } 
    }
    refresh();
}

function get_vessel_name(mmsi) {
    return fetch('/fleet/name/' + mmsi).then( async (response) =>{
        if (response.ok) {
            let data = await response.json();
            return data.name;
        } 
    }).catch(err => {
        console.error(err);
    });
}

async function addShipToDB(mmsi, name) { 
    var ship_info = await getVesselInfoFromMarineTraffic(mmsi);
    
    if (ship_info != null) {
        var data = JSON.stringify({"name": name, "mmsi": mmsi, "info" : ship_info}); 

        // post data to server
        postData('/fleet', data).then(res => 
            console.log(res)).catch(err => console.log(err));
    } else {
        alert(`Ship information for ${name} with MMSI: ${mmsi} isn't currently available on Marine Traffic`);
    }
} 


// =================================================   REMOVE
removeShipBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    removeShipsBtnFunctionality();
});

async function removeShipsBtnFunctionality() {
    var allMMSI = parseInput(document.getElementById("inputMMSI").value);
    console.log("MMSI input for deletion: " + allMMSI);
    editFleetForm.style.visibility = 'hidden';

    for (let i in allMMSI) {
        if (allMMSI[i] != "") {
            await removeShipFromDB(allMMSI[i]);
        }
    }
    refresh();
}

function removeShipFromDB(MMSI) {
    deleteData("/fleet/" + MMSI).then(data => 
        console.log(data)).catch(err => console.log(err));
}


//==============================================================
//                                 BackEnd Helper Functions:


async function postData(url = '', data = '') { 
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });
    return response;
} 

async function putData(url = '', data = '') {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: data
    });
    return response;
}

async function deleteData(url = '') {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response;
}

async function getData(url = '') {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
}
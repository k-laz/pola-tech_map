mapboxgl.accessToken = 'pk.eyJ1Ijoia2xheiIsImEiOiJja2h1bGl3dXYyYjB0MzJrNnNxcnBmc3pzIn0.9qgI_dzZzzMnDvPDtWWR6Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [0, 30],
    zoom: 1,
    maxZoom: 15,
});

//                                      MAIN MAP FUNCTION WITH PORTS DATA:

// older port_icon : 'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png'
map.on('load', () => {
    map.loadImage(
      '/port_icon.png',
      function (error, image) {
          if (error) throw error;
          map.addImage('custom-marker', image);
          //    PORTS:
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
                  'icon-image': 'custom-marker',
                  'icon-size': 0.11,
                  // get the title name from the source's "title" property
                  'text-field': ['get', 'name'],
                  'text-font': [
                      'Open Sans Semibold',
                      'Arial Unicode MS Bold'
                  ],
                  'text-offset': [0, .5],
                  'text-anchor': 'top',
                  'text-size': 10
              }
          });
      }
  );
});


// -------------------------------------------------------------
// -------------------------------------------------------------

//                                BUTTON TO DISABLE PORTS:

// enumerate ids of the layers
var toggleableLayerIds = ['ports'];

for (var i = 0; i < toggleableLayerIds.length; i++) {
    var id = toggleableLayerIds[i];

    var link = document.createElement('a');
    link.href = '#';
    link.className = 'active';
    link.textContent = id;

    link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        // toggle layer visibility by changing the layout object's visibility property
        if (visibility === 'visible') {
            map.setLayoutProperty(clickedLayer, 'visibility', 'none');
            this.className = '';
        } else {
            this.className = 'active';
            map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
    };

    var layers = document.getElementById('menu');
    layers.appendChild(link);
}



// -------------------------------------------------------------
// -------------------------------------------------------------
//                                                WEATHER API:

var weatherVisible = false;

var weatherSwtich = document.createElement('a');
weatherSwtich.href = '#';
weatherSwtich.className = '';
weatherSwtich.textContent = "weather";
document.getElementById('menu').appendChild(weatherSwtich);

weatherSwtich.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();

    // to set background color from blue to white when on/off
    if (weatherVisible) {
        weatherSwtich.className = '';
    } else {
        weatherSwtich.className = 'active';
    }
    weatherVisible = !weatherVisible;
})

map.on('click', function(e) {
    editFleetForm.style.visibility = 'hidden';

    if (weatherVisible) {
        var popup = new mapboxgl.Popup();
        let req = new XMLHttpRequest();
        req.onload = () => {
            console.log(`Data Loaded: ${req.status} ${req.response}`);
            let txtbox = document.getElementById("textBox");
            if (req.status == 200) {
                var data = JSON.parse(req.response);
                popup.setLngLat(e.lngLat).setHTML(
                    `<h3> ${data.timezone} 
                    | temp ${data.current.temp} C
                    | ${data.current.weather[0].main} 
                    | wind speed ${data.current.wind_speed} m/s
                    </h3>`).addTo(map);  

                txtbox.textContent = `Weather at ${e.lngLat} : ${data.timezone} 
                | temp = ${data.current.temp} 
                | main = ${data.current.weather[0].main} 
                | wind speed = ${data.current.wind_speed}`;
            }
        }
        let weather_api_call = `https://api.openweathermap.org/data/2.5/onecall?lat=${e.lngLat.lat}&units=metric&lon=${e.lngLat.lng}&appid=12408e3213cd16c3e6649ef31690a0f6`;
        req.open('GET', weather_api_call);
        req.send();
    }
});

// ------------------------------------------------------------------------------
// ------------------------------------------------------------------------------
//                                             DRAWING VESSELS ONTO THE MAP FROM DB:

const ship_dropdown = document.getElementById('ship-list');  
//const VesselAPIkey = process.env.MARINE_TRAFFIC_API_SECRET_KEY;
const VesselAPIkey = "https://services.marinetraffic.com/api/exportvessel/v:5/7f70cbed5527332c828792c7bce77421dd54fbe8/timespan:2880/protocol:jsono/mmsi:";
const shipCoordinates = new Map();

drawAllVesselsFromDB();

async function drawAllVesselsFromDB() {
    var data = await get_all_vessel_data_from_db();
    console.log("inside draw -> data: " + data.length);
    clearDropDownMenu();

    for (var i = 0; i < data.length; i++) {
        if (data[i].info != undefined) {
            var ship_form = document.createElement('div');
            ship_form.setAttribute('class', 'ship_form');
            ship_form.setAttribute('value', data.mmsi);
            var text = document.createElement('p');
            
            // creates an info table for the vessel from the provided info
            for (x in data[i].info) {
                text.innerHTML += x + " : " + data[i].info[x] + "  |  ";
            }

            // creates a popup for the ship
            let shipPopup = new mapboxgl.Popup({
                anchor: "bottom",
                offset: [0, -8]
            });

            ship_form.appendChild(text);
            shipPopup.setHTML(ship_form.innerText);

            var shipIcon = document.createElement('div');
            shipIcon.classList.add('ship');

            var ship_marker = new mapboxgl.Marker(shipIcon, {
                draggable: false,
            });

            // inputs all of the data into the popup as well as setting the ships position
            // can add .setRotation(data[i].COURSE) to rotate the icon in the direction of the course of the ship
            ship_marker.setLngLat([data[i].info.LON, data[i].info.LAT]).setPopup(shipPopup).setRotation(data[i].info.COURSE).addTo(map);

            // adding coordinates into map array structure for fast retrieval 
            shipCoordinates.set(data[i].mmsi, [data[i].info.LON, data[i].info.LAT]);


            // add the ship to the drop down
            let ship_option = document.createElement('option');
            ship_option.value = data[i].mmsi;
            ship_option.innerText = data[i].mmsi;
            ship_dropdown.appendChild(ship_option);
        }
    }
}

function refresh() {    
    setTimeout(function () {
        location.reload()
    }, 100);
}

async function get_all_vessel_data_from_db() {
    let response = await fetch("/get_all_data");
    if (response.ok) {
        let data = await response.json();
        return data;
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

// ---------------------------------------------------------------------------------------------
// ---------------------------------------------------------------------------------------------
//                                              UPDATE SHIP INFO FROM MARINE TRAFFIC:

var editFleet = document.createElement('a');
editFleet.href = '#';
editFleet.className = 'active';
editFleet.textContent = "edit fleet";
document.getElementById('menu').appendChild(editFleet);
var editFleetForm = document.getElementById("editFleetForm");
const addShipBtn = document.getElementById('addBtn');
const removeShipBtn = document.getElementById('removeBtn');
const updateShipBtn = document.getElementById('updateBtn');
editFleet.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    if (editFleetForm.style.visibility == 'visible') {
        editFleetForm.style.visibility = 'hidden';
    } else {
        editFleetForm.style.visibility = 'visible';
    }
});



updateShipBtn.onclick = (e => {
    updateBtnFunctionality(e);
});

async function updateBtnFunctionality(e) {
    e.preventDefault();
    e.stopPropagation();
    let p = await UPDATE_ALL_VESSELS_INFO();

    editFleetForm.style.visibility = 'hidden';

    refresh();
}

//============================================================================================
//                      UPDATING THE ENTIRE COLLECTION WITH DATA FROM MARINE TRAFFIC


async function UPDATE_ALL_VESSELS_INFO() {
    var allMMSI = await get_all_mmsi();

    // clear the entire database collection "fleet"
    var p = await deleteData("/delete_all");

    // add all of the vessels back into the database with new info
    for (mmsi in allMMSI) {
        console.log("in the for looP");
        var s = await addShipToDB(allMMSI[mmsi]);
    }
}

//                                         GETTING ALL MMSI FROM THE DB:
async function get_all_mmsi() {
    let response = await fetch("/get_all_data");
    if (response.ok) {
        let data = await response.json();
        let arr = [];
        for (vessel in data) {
            arr.push(data[vessel].mmsi);
        }
        return arr;
    } else {
        alert("HTTP-Error: " + response.status);
    }
}


//============================================================================================
//                    GETTING A SINGLE VESSEL INFO FROM MARINE TRAFFIC WITH AN API CALL:
async function getVesselInfoFromMarineTraffic(APIkey, mmsi) {
    let response = await fetch(APIkey + mmsi);
    if (response.ok) {
        let data = await response.json();
        return data[0];
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

//=============================================================================================
//                                         DROPDOWN MENU FUNCTIONALITY:


ship_dropdown.onchange = () => {
    var mmsi = ship_dropdown.options[ship_dropdown.selectedIndex].value; 
    var coordinates = shipCoordinates.get(mmsi);
    map.jumpTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 7
    });
}

function clearDropDownMenu() {
    while (ship_dropdown.firstChild) {
        ship_dropdown.removeChild(ship_dropdown.lastChild);
    }
    var baseChild = document.createElement('option');
    baseChild.value = "";
    baseChild.style = "display: none;";
    baseChild.selected;
    baseChild.innerText = "Your Fleet";
    ship_dropdown.appendChild(baseChild);
}



//=============================================================================================
//                                         ADD/REMOVE SHIP FROM DB

function parseInput(text) {
    var lines = text.split("\n");
    return lines;
}


// ==============================================   ADD
addShipBtn.onclick = (e => {
    addBtnFunctionality(e);
});
async function addBtnFunctionality(e) {
    e.preventDefault();
    e.stopPropagation();
    var allMMSI = parseInput(document.getElementById("inputMMSI").value);
    console.log(allMMSI);
    editFleetForm.style.visibility = 'hidden';

    for (let i in allMMSI) {
        var existInDB = await existsInDB(allMMSI[i]);
        if (allMMSI[i] != "" && !existInDB) {
    
            // add to the database, request an api call to the Marine Traffic 
            await addShipToDB(allMMSI[i]);
        } else {
            warning("mmsi: " + allMMSI[i] + " has already been added");
        }
    }
    //drawAllVesselsFromDB();
    refresh();
}

function warning(text) {
    // OUTPUT A WARNING TO THE USER.
    console.log(text);
}



// =========================================         REMOVE
removeShipBtn.onclick = (e => {
    removeShipsBtnFunctionality(e);
});

async function removeShipsBtnFunctionality(e) {
    e.preventDefault();
    e.stopPropagation();
    var allMMSI = parseInput(document.getElementById("inputMMSI").value);
    console.log(allMMSI);
    editFleetForm.style.visibility = 'hidden';

    for (let i in allMMSI) {
        var existInDB = await existsInDB(allMMSI[i]);
        if (allMMSI[i] != "" && existInDB) {

            // remove ship from dropdown
    
            // add to the database, request an api call to the Marine Traffic 
            removeShipFromDB(allMMSI[i]);
        } else {
            warning("mmsi: " + allMMSI[i] + " has already been added");
        }
    }
    // update the map and redraw the vessels from DB
    drawAllVesselsFromDB();
    refresh();
}


//==============================================================
//                                 Helper Server Functions:


async function addShipToDB(mmsi) { 
    var ship_info = await getVesselInfoFromMarineTraffic(VesselAPIkey, mmsi);
    var data = JSON.stringify({"mmsi": mmsi, "info" : ship_info}); 


    // add ship to dropdown
    let ship_option = document.createElement('option');
    ship_option.value = mmsi;
    ship_option.innerText = mmsi;
    ship_dropdown.appendChild(ship_option);

    // post data to server
    postData('/add_vessel_data', data).then(data => 
        console.log(data)).catch(err => console.log(err));
} 

function removeShipFromDB(mmsi) {

    // remove ship from dropdown



    deleteData("/delete_vessel/" + mmsi).then(data => 
        console.log(data)).catch(err => console.log(err));
}

async function existsInDB(mmsi) {
    let response = await fetch("/exists_in_db/" + mmsi);
    if (response.ok) {
        let data = await response.json();
        return data.exists;
    } else {
        alert("HTTP-Error: " + response.status);
    }
}


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

async function deleteData(url = '') {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const resData = await 'Resource Deleted...';
    return resData;
}



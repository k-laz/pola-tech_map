mapboxgl.accessToken = 'pk.eyJ1Ijoia2xheiIsImEiOiJja2h1bGl3dXYyYjB0MzJrNnNxcnBmc3pzIn0.9qgI_dzZzzMnDvPDtWWR6Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [20, 37],
    zoom: 5 ,
    maxZoom: 15,
});

//                                  MAIN MAP FUNCTION WITH PORTS DATA:

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
                  'icon-size': 0.23,
                  // get the title name from the source's "title" property
                  'text-field': ['get', 'name'],
                  'text-font': [
                      'Open Sans Semibold',
                      'Arial Unicode MS Bold'
                  ],
                  'text-offset': [0, 1.2],
                  'text-anchor': 'top',
                  'text-size': 12
              }
          });
      }
  );
});


// -------------------------------------------------------------
// -------------------------------------------------------------

//                          BUTTON TO DISABLE PORTS:

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
//                                                       VESSEL LOGIC AND API:

const ship_dropdown = document.getElementById('ship-list');  
const VesselAPIkey = "https://services.marinetraffic.com/api/exportvessel/v:5/bef14d8cede92a982acb571a1cdd8285904078a7/timespan:20/protocol:jsono/mmsi:";                          
const ships = new Map();
mapVessels();


// I am creating a map here for extra info about the ships 
// key = mmsi, value = coordinates(or maybe more info)
// I could have added all of this info to the database, 
// but I dont want to rewrite the entire thing, 
// so I am adding this extra map that is going to get info from the api call from Marine Traffic
var shipCoordinates = new Map();


async function mapVessels() {
    await loadMap();

    function assignAndDraw(key, value) {  
        // key = mmsi
        // value = name of the ship


        // add the ships to the dropdown
        let ship_option = document.createElement('option');
        ship_option.value = key;
        ship_option.innerText = value + " : " + key;
        ship_dropdown.appendChild(ship_option);

        // send the request to the MarineTraffic API
        drawVesselToMapFromAPI(VesselAPIkey, key);
    }
    // iterator that fills the dropdown and asks the Marine Traffic API
    ships.forEach(assignAndDraw);
}

async function loadMap() {
    let response = await fetch("/load_map");
    if (response.ok) {
        let data = await response.json();
        for (var i = 0; i < data.length; i++) {
            ships.set(data[i].name, data[i].mmsi);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}


async function drawVesselToMapFromAPI(APIkey, value) {
    let response = await fetch(APIkey + value);
    if (response.ok) {
        let data = await response.json();
        for (var i = 0; i < data.length; i++) {
            var ship_form = document.createElement('div');
            ship_form.setAttribute('class', 'ship_form');
            var text = document.createElement('p');
            
            // creates an info table for the vessel from the provided info
            for (x in data[i]) {
                text.innerHTML += x + " : " + data[i][x] + "  |  ";
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
            ship_marker.setLngLat([data[i].LON, data[i].LAT]).setPopup(shipPopup).addTo(map);

            // adding extra info into the second map structure
            shipCoordinates.set(value, [data[i].LON, data[i].LAT]);
        }
    } else {
        alert("HTTP-Error: " + response.status);
    }
}

// --------------------------------------------------
// --------------------------------------------------
//                                        ADD AND REMOVE SHIPS FROM THE DATABASE:

var editFleet = document.createElement('a');
editFleet.href = '#';
editFleet.className = 'active';
editFleet.textContent = "edit fleet";
document.getElementById('menu').appendChild(editFleet);

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

addShipBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    var name = document.getElementById('inputName').value;
    var mmsi = document.getElementById('inputMMSI').value;
    if (name != '' && mmsi != '' && !ADuplicate(name, mmsi)) {
        // add to the map
        ships.set(name, mmsi);

        // add to dropdown
        let ship_option = document.createElement('option');
        ship_option.value = mmsi;
        ship_option.innerText = name + " : " + mmsi;
        ship_dropdown.appendChild(ship_option);

        // add to the database
        addShipToDB(name, mmsi);

        ships.forEach(updateMap());

        editFleetForm.style.visibility = 'hidden';
    } else {
        console.log("Adding a duplicate or identical mmsi!!")
    }
});

// Updates the map
function updateMap(key, value) {
    // send the request to the MarineTraffic API
    drawVesselToMapFromAPI(VesselAPIkey, key);
}

removeShipBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    var name = document.getElementById('inputName').value;
    var mmsi = document.getElementById('inputMMSI').value;
    if (ADuplicate(name, mmsi)) {
        // remove from the map
        ships.delete(name);

        // remove from the dropdown
        var child_removed = document.querySelectorAll(`option[value="${mmsi}"]`);
        ship_dropdown.removeChild(child_removed[0]);

        // remove from the database
        removeShipFromDB(name, mmsi);

        //updates the map
        ships.forEach(updateMap());

        editFleetForm.style.visibility = 'hidden';
    }
});

// checks if the ship is a duplicate
function ADuplicate(name, mmsi) {
    result = false;
    // ships.forEach((key, value) => {
    //     if ((key == mmsi) || (value == name)) {
    //         console.log("key : " + key + "mmsi: " + mmsi);
    //         result = true
    //     }
    // });
    if (ships.has(name)) {
        result = true;
    }
    return result;
}

//---------------------------------------
//--------------------------------------------------------------------------------
//                                         DROPDOWN MENU FUNCTIONALITY:


ship_dropdown.onchange = () => {
    var mmsi = ship_dropdown.options[ship_dropdown.selectedIndex].value; 
    var coordinates = shipCoordinates.get(mmsi);
    map.jumpTo({
        center: [coordinates[0], coordinates[1]],
        zoom: 7
    });
}






// Function to send user input (name of the ship and its mmsi) into server.js
// server.js then sends it into mongodb.

function addShipToDB(name, mmsi) { 
    var xhr = new window.XMLHttpRequest(); 
    xhr.open("POST", "/vessel_data", true); 

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xhr.overrideMimeType("text/html");
    // Create a state change callback 
    // xhr.onreadystatechange = function () { 
    //     if (xhr.readyState === 4 && xhr.status === 200) { 

    //         // Print received data from server 
    //         console.log("success??")

    //     } 
    // }; 
    var data = JSON.stringify({ "name": name, "mmsi": mmsi }); 
    xhr.send(data); 
} 

function removeShipFromDB(name, mmsi) {
    var xhr = new window.XMLHttpRequest(); 
    xhr.open("POST", "/vessel_remove_data", true); 

    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8"); 
    xhr.overrideMimeType("text/html");
 
    var data = JSON.stringify({ "name": name, "mmsi": mmsi }); 
    xhr.send(data); 
}

// --------------------------------------------------
// --------------------------------------------------
// shipIcon.onmouseover = () => shipIcon.togglePopup();

// var scale = new mapboxgl.ScaleControl({
//     maxWidth: 80,
//     unit: 'metric'
// });
// map.addControl(scale);

 // let name = document.querySelector('#inputName'); 
// let mmsi = document.querySelector('#inputMMSI'); 


// //                             PORTS:

// var ports = require("sea-ports");
// port_data = ports.JSON;
// // Object.keys(port_data).forEach(key=>{
// //     // console.log(`${key} : ${port_data[key].coordinates}`);
// //     var port_point = new mapboxgl.Marker({
// //         color: "#ff0000"
// //     }).setLngLat([port_data[key].coordinates[0], port_data[key].coordinates[1]]).addTo(map);
// // })

// for (let port of Object.keys(port_data)) {
//     if (port_data[port].coordinates != undefined) {
//         var port_point = new mapboxgl.Marker({
//             color: "#ff0000"
//         }).setLngLat([port_data[port].coordinates[0], port_data[port].coordinates[1]]).addTo(map);
//     }
// }


//                             OLD WAY OF CONNECTING TO API
// var request = new XMLHttpRequest()
// request.onload = () => {
//     console.log(`Data Loaded: ${request.status} ${request.response}`);
//     request.onerror = () => {
//         console.error('Request failed.');
//     }
//     if (request.status == 200) {
//         var data = JSON.parse(request.response);
        // for (var i = 0; i < data.length; i++) {
        //     var ship_form = document.createElement('div');
        //     ship_form.setAttribute('class', 'ship_form');

        //     var text = document.createElement('p');

        //     for (x in data[i]) {
        //         text.innerHTML += x + " : " + data[i][x] + "  |  ";
        //     }

        //     // creates a popup for the ship
        //     let shipPopup = new mapboxgl.Popup({
        //         anchor: "bottom",
        //         offset: [0, -8]
        //     });

        //     ship_form.appendChild(text);
        //     shipPopup.setHTML(ship_form.innerText);

        //     var shipIcon = document.createElement('div');
        //     shipIcon.classList.add('ship');

        //     var ship_marker = new mapboxgl.Marker(shipIcon, {
        //         draggable: false,
        //     });

        //     // inputs all of the data into the popup as well as setting the ships position
        //     ship_marker.setLngLat([data[i].LON, data[i].LAT]).setPopup(shipPopup).setRotation(data[i].HEADING).addTo(map);
        // }
        
//     } else {
//         console.log('Error!');
//     }  
// };

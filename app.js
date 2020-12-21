mapboxgl.accessToken = 'pk.eyJ1Ijoia2xheiIsImEiOiJja2h1bGl3dXYyYjB0MzJrNnNxcnBmc3pzIn0.9qgI_dzZzzMnDvPDtWWR6Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [20, 37],
    zoom: 5 ,
    maxZoom: 15,
});

//                                  MAIN MAP FUNCTION WITH PORTS DATA:
map.on('load', () => {
    map.loadImage(
      'https://docs.mapbox.com/mapbox-gl-js/assets/custom_marker.png',
      function (error, image) {
          if (error) throw error;
          map.addImage('custom-marker', image);
  
          //    PORTS:
          map.addSource('ports', {
            type: 'geojson',
            data: 'https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_10m_ports.geojson'
          });
  
          // Add a symbol layer
          map.addLayer({
              'id': 'ports',
              'type': 'symbol',
              'source': 'ports',
              'layout': {
                  'icon-image': 'custom-marker',
                  // get the title name from the source's "title" property
                  'text-field': ['get', 'name'],
                  'text-font': [
                      'Open Sans Semibold',
                      'Arial Unicode MS Bold'
                  ],
                  'text-offset': [0, 1.5],
                  'text-anchor': 'top',
                  'text-size': 13
              }
          });
      }
  );
});


// -------------------------------------------------------------
// -------------------------------------------------------------

// BUTTONS TO DISABLE PORTS:

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
    shipAddForm.style.visibility = 'hidden';

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

// -------------------------------------------------------------
// -------------------------------------------------------------

//                                              VESSEL LOGIC AND API:



//                                 INIT API
var request = new XMLHttpRequest()
request.onload = () => {
    console.log(`Data Loaded: ${request.status} ${request.response}`);
    request.onerror = () => {
        console.error('Request failed.');
    }
    if (request.status == 200) {
        var data = JSON.parse(request.response);
        for (var i = 0; i < data.length; i++) {
            var ship_form = document.createElement('div');
            ship_form.setAttribute('class', 'ship_form');

            var text = document.createElement('p');

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
            ship_marker.setLngLat([data[i].LON, data[i].LAT]).setPopup(shipPopup).setRotation(data[i].HEADING).addTo(map);
        }
        
    } else {
        console.log('Error!');
    }  
};

// load the data from the db into the map
var ships = new Map();

// // Go through every item in the ship map and call its locaiton via api
// var template = "https://services.marinetraffic.com/api/exportvessel/v:5/bef14d8cede92a982acb571a1cdd8285904078a7/timespan:20/protocol:jsono/mmsi:";


// for (let [key, value] of ships.entries()) {               
//     console.log(key + ' = ' + value);
    
//     // request.open("GET", template + value);
//     // request.send();
// }


// --------------------------------------------------
// --------------------------------------------------
//                                               ADD SHIPS TO THE ARRAY:

var addShip = document.createElement('a');
addShip.href = '#';
addShip.className = 'active';
addShip.textContent = "edit fleet";
document.getElementById('menu').appendChild(addShip);

var shipAddForm = document.getElementById("shipAddForm");
var addShipBtn = document.getElementById('addBtn');

addShip.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    if (shipAddForm.style.visibility == 'visible') {
        shipAddForm.style.visibility = 'hidden';
    } else {
        shipAddForm.style.visibility = 'visible';
    }
});


// dropdown menu for the fleet
var ship_dropdown = document.getElementById('ship-list');


addShipBtn.onclick = (e => {
    e.preventDefault();
    e.stopPropagation();
    var name = document.getElementById('inputName').value;
    var mmsi = document.getElementById('inputMMSI').value;
    if (name != '' && mmsi != '') {
       
        ships.set(name, mmsi);
        
        let ship_option = document.createElement('option');
        ship_option.value = name;
        ship_option.innerText = name + " : " + mmsi;
        ship_dropdown.appendChild(ship_option);
    }


    if (shipAddForm.style.visibility == 'visible') {
        shipAddForm.style.visibility = 'hidden';
    } else {
        shipAddForm.style.visibility = 'visible';
    }
})



// --------------------------------------------------
// --------------------------------------------------

  
// shipIcon.onmouseover = () => shipIcon.togglePopup();

// var scale = new mapboxgl.ScaleControl({
//     maxWidth: 80,
//     unit: 'metric'
// });
// map.addControl(scale);




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

mapboxgl.accessToken = 'pk.eyJ1Ijoia2xheiIsImEiOiJja2h1bGl3dXYyYjB0MzJrNnNxcnBmc3pzIn0.9qgI_dzZzzMnDvPDtWWR6Q';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: [20, 37],
    zoom: 5 ,
    maxZoom: 15,
});

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


var shipIcon = document.createElement('div');
shipIcon.classList.add('ship');

var shipPopup = new mapboxgl.Popup({
    anchor: "bottom",
    offset: [0, -8]
});

var ship_point = document.createElement('div');
ship_point.classList.add('ship');
var marker3 = new mapboxgl.Marker(ship_point, {
    draggable: false,
});

marker3.setLngLat([50, -3]).setRotation(0).addTo(map);


var weather_api_call = "";
map.on('click', function(e) {
    var popup = new mapboxgl.Popup();
    //                                      WEATHER API:
    weather_api_call = `https://api.openweathermap.org/data/2.5/onecall?lat=${e.lngLat.lat}&units=metric&lon=${e.lngLat.lng}&appid=12408e3213cd16c3e6649ef31690a0f6`;
    let req = new XMLHttpRequest();
    req.onload = () => {
        console.log(`Data Loaded: ${req.status} ${req.response}`);
        let txtbox = document.getElementById("textBox");
        if (req.status == 200) {
            var data = JSON.parse(req.response);

            if (!shipPopup.isOpen()) {
                popup.setLngLat(e.lngLat).setHTML(
                    `<h3> ${data.timezone} 
                    | temp ${data.current.temp} C
                    | ${data.current.weather[0].main} 
                    | wind speed ${data.current.wind_speed} m/s
                    </h3>`).addTo(map);  
            }
            txtbox.textContent = `Weather at ${e.lngLat} : ${data.timezone} 
                | temp = ${data.current.temp} 
                | main = ${data.current.weather[0].main} 
                | wind speed = ${data.current.wind_speed}`;
        }
    }
    req.open('GET', weather_api_call);
    req.send();
});



//                                    VESSEL API:
var exampleAPIreq = "https://services.marinetraffic.com/api/exportvessel/v:5/bef14d8cede92a982acb571a1cdd8285904078a7/timespan:20/protocol:jsono/mmsi:311020600";
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

            ship_form.appendChild(text);
            shipPopup.setHTML(ship_form.innerText);
            marker3.setLngLat([data[i].LON, data[i].LAT]).setPopup(shipPopup).setRotation(data[i].HEADING).addTo(map);
        }
        
    } else {
        console.log('Error!');
    }  
};

// request.open('GET', exampleAPIreq);
// request.send();

// shipIcon.onclick = (event) => {
//     // you can add custom logic here. For example, modify popup.
//     shipIcon.setHTML("<h3>I'm clicked!</h3>");
// }
  
// shipIcon.onmouseover = () => shipIcon.togglePopup();

// var scale = new mapboxgl.ScaleControl({
//     maxWidth: 80,
//     unit: 'metric'
// });
// map.addControl(scale);




// //                              PORTS:

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

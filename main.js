// IIFE
(() => {
/*
Fetch real-time bus data from the provided API.
Transform the raw data into GeoJSON format.
Plot markers on the map using Leaflet and GeoJSON data. 
Implement auto-refresh functionality to update the map with the latest bus positions.
*/



    //create map in leaflet and tie it to the div called 'theMap'
    //coordinates are where the map is centered
    let map = L.map('theMap').setView([44.66958325842197, -63.614710897266605], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        //popup
    L.marker([44.66958325842197, -63.614710897266605]).addTo(map)
        .bindPopup('This is NSCC IT!')
        .openPopup();

        //API URL
        const url = 'https://prog2700.onrender.com/hrmbuses';


        //add the bus marker to the map
        let markerLayer = L.layerGroup().addTo(map);

        //call asychronously
        async function fetchBusData(){
            try{
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

        //handle the response object
        const json = await response.json();


        //
        let busJson = json.entity;

        //clear existing markers
        markerLayer.clearLayers();


        //echo out busses in service
        console.log('There are currently ' + busJson.length + ' buses in service.');
        document.getElementById('busCount').innerHTMl = "There are " + busJson.length + " buses in service."


        // use map() to create a new array with the only data we want
        //comvert GeoJSON (optional)
        // go through aray and pull out data one by one
        //latitude
        //longitude 
        //bearing
        //timestamp
        const markers = busJson.map(getPosID);

        function getPosID(eachBus) {
            let busId = eachBus.id;
            let busLat = eachBus.vehicle.position.latitude;
            let busLon = eachBus.vehicle.position.longitude;
            let bearing = eachBus.vehicle.position.bearing;
            let timestamp = eachBus.vehicle.timestamp;
            //multiply string and turn into number
            let speed = Math.floor(eachBus.vehicle.position.speed * 1);
            //define bus icon
            //use half size
            var busIcon = L.icon ({
                iconUrl: './bus.png',
                iconSize: [50, 51],
                iconSize: [25, 26],
                popupAnchor: [-3, -50]
            });

        //use leaflet to create the bus marker
        //feed it the coordinates from the api and bind popup to it
        //add marker to the layer not the map
        let marker = L.marker([busLat, busLon], {icon: busIcon, rotationAngle: bearing}).bindPopup("Bus ID: " + busId + "<br>Speed: " + speed + " km/h" + "<br>Bearing: " + bearing);
        markerLayer.addLayer(marker);
        }
    } catch (error){
        console.error('An error ocurred', error);
    }
}




        //use event listener to update every 10 seconds
        window.addEventListener('load', function() {
            var fetchInterval = 10000;
            setInterval(fetchBusData, fetchInterval);
        });
})();
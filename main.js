// IIFE
(() => {
    // Fetch real-time bus data from the provided API.
    // Transform the raw data into GeoJSON format.
    // Plot markers on the map using Leaflet and GeoJSON data. 
    // Implement auto-refresh functionality to update the map with the latest bus positions.

    // Create map in Leaflet and tie it to the div called 'theMap'
    // Coordinates are where the map is centered
    let map = L.map('theMap').setView([44.66958325842197, -63.614710897266605], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Popup
    L.marker([44.66958325842197, -63.614710897266605]).addTo(map)
        .bindPopup('NSCC IT!')
        .openPopup();

    // API URL
    const url = 'https://prog2700.onrender.com/hrmbuses';

    // Add the bus marker to the map
    let markerLayer = L.layerGroup().addTo(map);

    // Store previous bus positions
    let previousBusPositions = {};

    // Calculate intermediate positions
    function calculateIntermediatePosition(previousPosition, newPosition, progress) {
        // Example: Linear interpolation
        return [
            previousPosition[0] + (newPosition[0] - previousPosition[0]) * progress,
            previousPosition[1] + (newPosition[1] - previousPosition[1]) * progress
        ];
    }

/////////tried adding an animation in between positions to 
//create the illusion of motion and make it easier to 
//track the bus that you need

//which was an issue where i found the buses look like their 
//"teleporting" so then anytime they move i need to tap 
//to see which ones the one i was following

    // // Update marker positions with animation
    // function updateMarkerPositions() {
    //     markerLayer.eachLayer(layer => {
    //         const busID = layer.feature.properties.busID;
    //         const previousPosition = previousBusPositions[busID];
    //         const newPosition = [layer.feature.geometry.coordinates[1], layer.feature.geometry.coordinates[0]];

    //         if (previousPosition) {
    //             let progress = 0;
    //             const duration = 10000; // Animation duration in milliseconds
    //             const steps = 10; // Number of intermediate steps

    //             const animate = () => {
    //                 progress += 1 / steps;
    //                 if (progress <= 1) {
    //                     const intermediatePosition = calculateIntermediatePosition(previousPosition, newPosition, progress);
    //                     layer.setLatLng(intermediatePosition);
    //                     setTimeout(animate, duration / steps);
    //                 } else {
    //                     layer.setLatLng(newPosition); // Set final position
    //                     previousBusPositions[busID] = newPosition; // Update previous position
    //                 }
    //             };

    //             animate();
    //         } else {
    //             previousBusPositions[busID] = newPosition; // Store initial position
    //         }
    //     });
    // }

    // Asynchronously fetch bus data
    async function fetchBusData() {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            // Handle the response object
            const json = await response.json();

            let busJson = json.entity;

            // Update the bus count
            document.getElementById('busCount').innerHTML = "There are " + busJson.length + " buses in service.";

            // Clear existing markers
            markerLayer.clearLayers();

            // GeoJSON
            let busGeoJSON = {
                type: "FeatureCollection",
                features: []
            };

            // Convert bus data to GeoJSON
            busJson.map(eachBus => {
                    let busId = eachBus.id;
                    let busLat = eachBus.vehicle.position.latitude;
                    let busLon = eachBus.vehicle.position.longitude;
                    let bearing = eachBus.vehicle.position.bearing;
                    let speed = Math.floor(eachBus.vehicle.position.speed * 1);
                    let routeId = eachBus.vehicle.trip.routeId; // included route id

                    busGeoJSON.features.push({
                        type: "Feature",
                        geometry: {
                            type: "Point",
                            coordinates: [busLon, busLat]
                        },
                        properties: {
                            busID: busId,
                            speed: speed,
                            bearing: bearing,
                            routeID: routeId // included route id
                        }
                    });
            });

            // Add GeoJSON features to marker layer
            L.geoJSON(busGeoJSON, {
                pointToLayer: function (feature, latlng) {
                    var busIcon = L.icon({
                        iconUrl: './bus.png',
                        iconSize: [25, 26],
                        popupAnchor: [-3, -50]
                    });
                    return L.marker(latlng, { icon: busIcon, rotationAngle: feature.properties.bearing })
                        .bindPopup("Bus ID: " + feature.properties.busID + "<br>Route ID: " + feature.properties.routeID + "<br>Speed: " + feature.properties.speed + " km/h" + "<br>Bearing: " + feature.properties.bearing);
                }
            }).addTo(markerLayer);

            // Update marker positions with animation
            updateMarkerPositions();

        } catch (error) {
            console.error('An error occurred', error);
        }
    }

    // Use event listener to update every 10 seconds
    window.addEventListener('load', function () {
        var fetchInterval = 10000;
        setInterval(fetchBusData, fetchInterval);
    });

    // Initial fetch
    fetchBusData();
})();
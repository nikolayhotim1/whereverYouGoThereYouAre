'use strict';
let watchId, map, prevCoords;

const ourCoords = {
    latitude: 47.624851,
    longitude: -122.52099
};

window.onload = getMyLocation;

function getMyLocation() {
    if (navigator.geolocation) {
        let watchButton = document.getElementById('watch');
        let clearWatchButton = document.getElementById('clearWatch');

        watchButton.onclick = watchLocation;
        clearWatchButton.onclick = clearWatch;
    } else {
        alert('Oops, no geolocation support');
    }
}

// Code to watch the user's location
function watchLocation() {
    watchId = navigator.geolocation.watchPosition(
        displayLocation,
        displayError,
        { timeout: 5000 }
    );
}

function clearWatch() {
    if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        watchId = null;
    }
}

function displayLocation(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    let location = document.getElementById('location');
    let distance = document.getElementById('distance');
    let km = computeDistance(position.coords, ourCoords);

    location.innerHTML = `You are at latitude: ${latitude}, longitude: ${longitude} with ${position.coords.accuracy} meters accuracy`;
    distance.innerHTML = `You are ${km} km from the WickedlySmart HQ`;

    if (!map) {
        showMap(position.coords);

        prevCoords = position.coords;
    } else {
        let meters = computeDistance(position.coords, prevCoords) * 1000;

        if (meters > 20) {
            scrollMapToPosition(position.coords);

            prevCoords = position.coords;
        }
    }
}

function displayError(error) {
    const errorTypes = {
        0: 'Unknown error',
        1: 'Permission denied',
        2: 'Position is not available',
        3: 'Request timeout'
    };

    let errorMessage = errorTypes[error.code];
    let location = document.getElementById('location');

    if (error.code === 0 || error.code === 2) {
        errorMessage += error.message;
    }

    location.innerHTML = errorMessage;
}

function computeDistance(startCoords, destCoords) {
    const Radius = 6371; // radius of the Earth in km
    let startLatRads = degreesToRadians(startCoords.latitude);
    let startLongRads = degreesToRadians(startCoords.longitude);
    let destLatRads = degreesToRadians(destCoords.latitude);
    let destLongRads = degreesToRadians(destCoords.longitude);

    let distance = Math.round(
        Math.acos(
            Math.sin(startLatRads) *
            Math.sin(destLatRads) +
            Math.cos(startLatRads) *
            Math.cos(destLatRads) *
            Math.cos(startLongRads - destLongRads)
        ) * Radius
    );

    return distance;
}

function degreesToRadians(degrees) {
    let radians = (degrees * Math.PI) / 180;

    return radians;
}

function showMap(coords) {
    let googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);
    let mapDiv = document.getElementById('map');

    const mapOptions = {
        zoom: 12,
        center: googleLatAndLong,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };

    map = new google.maps.Map(mapDiv, mapOptions);

    // add the user marker
    let title = 'Your Location';
    let content = `You are here: ${coords.latitude}, ${coords.longitude}`;

    addMarker(map, googleLatAndLong, title, content);
}

function addMarker(map, latlong, title, content) {
    const markerOptions = {
        position: latlong,
        map: map,
        title: title,
        clickable: true
    };

    let marker = new google.maps.Marker(markerOptions);

    const infoWindowOptions = {
        content: content,
        position: latlong
    };

    let infoWindow = new google.maps.InfoWindow(infoWindowOptions);

    google.maps.event.addListener(
        marker,
        'click',
        function () {
            infoWindow.open(map);
        }
    );
}

function scrollMapToPosition(coords) {
    let latitude = coords.latitude;
    let longitude = coords.longitude;
    let latlong = new google.maps.LatLng(latitude, longitude);

    map.panTo(latlong);

    // add the new marker
    addMarker(
        map,
        latlong,
        'Your new location',
        `You moved to: ${latitude}, ${longitude}`
    );
}
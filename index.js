'use strict';
let watchId, map;

let ourCoords = {
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
    watchId = navigator.geolocation.watchPosition(displayLocation, displayError);
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
    let km = computeDistance(position.coords, ourCoords);
    let location = document.getElementById('location');
    let distance = document.getElementById('distance');

    location.innerHTML = `You are at latitude: ${latitude}, longitude: ${longitude} with ${position.coords.accuracy} meters accuracy`;
    distance.innerHTML = `You are ${km} km from the WickedlySmart HQ`;

    // // alternative condition
    // if (km < 0.1) {
    //     distance.innerHTML = 'You\'re on fire!';
    // } else {
    //     if (prevKm > km) {
    //         distance.innerHTML = 'You\'re getting hotter!';
    //     } else {
    //         distance.innerHTML = 'You\'re getting colder...';
    //     }
    // }
    // prevKm = km;

    if (!map) {
        showMap(position.coords);
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

    let distance = Math.round(Math.acos(
        Math.sin(startLatRads) *
        Math.sin(destLatRads) +
        Math.cos(startLatRads) *
        Math.cos(destLatRads) *
        Math.cos(startLongRads - destLongRads)
    ) * Radius);

    return distance;
}

function degreesToRadians(degrees) {
    let radians = (degrees * Math.PI) / 180;

    return radians;
}

function showMap(coords) {
    let googleLatAndLong = new google.maps.LatLng(coords.latitude, coords.longitude);
    let mapDiv = document.getElementById('map');

    let mapOptions = {
        zoom: 10,
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
    let markerOptions = {
        position: latlong,
        map: map,
        title: title,
        clickable: true
    };

    let marker = new google.maps.Marker(markerOptions);

    let infoWindowOptions = {
        content: content,
        position: latlong
    };

    let infoWindow = new google.maps.InfoWindow(infoWindowOptions);

    google.maps.event.addListener(marker, 'click', function () {
        infoWindow.open(map);
    });
}
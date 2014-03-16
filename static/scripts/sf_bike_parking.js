$(function() {
  var clearMap  = function() {
    current_info_window && current_info_window.close();
    directions.display.setMap(null);
  };

  var flashError = function(message) {
    console.log(message);
    $('#notice').slideDown().html(message);
    setTimeout(function() {
      $('#notice').slideUp();
    }, 4000);
  };

  var addMarker = function(spot, icon) {
    if (spot.marker) return;
    var position = spot.coords || new google.maps.LatLng(
      spot.lat,
      spot.lng
    );
    return spot.marker = new google.maps.Marker({
      map: map,
      position: position,
      icon: icon
    });
  };

  var drawDirections = function(spot) {
    var request = {
      travelMode: 'BICYCLING',
      origin: current_position.coords,
      destination: new google.maps.LatLng(
        spot.lat,
        spot.lng
      )
    };
    directions.service.route(request, function(response, status) {
      if (status == google.maps.DirectionsStatus.OK) {
        directions.display.setMap(map);
        directions.display.setDirections(response);
      }
      else {
        flashError(status);
      }
    });
  }

  var showSpotInfo = function(marker, spot) {
    $('#spot-info').slideDown().html(Mustache.render(popup_template, {
      spot: spot,
      current: current_position.coords
    }));
;
    drawDirections(spot);
  }

  var drawParkingSpot = function(spot) {
    var marker = addMarker(spot);
    if (!marker) return;

    google.maps.event.addListener(marker, 'click', function() {
      clearMap();
      showSpotInfo(marker, spot);
    });
  }

  var pointInBounds = function(point, north_east, south_west) {
    if (point.lat > north_east.lat() ||
          point.lat < south_west.lat()) return false;

    else if (point.lng > north_east.lng() ||
          point.lng < south_west.lng()) return false;

    else return true;
  };

  var updateParkingSpots = function() {
    var bounds = map.getBounds();
    if (!bounds || !parking_spots) {
      setTimeout(updateParkingSpots, 200);
      return;
    }
    var north_east = bounds.getNorthEast(),
        south_west = bounds.getSouthWest();

    var found_a_spot = false;
    for (var i in parking_spots) {
      var spot = parking_spots[i];
      if (pointInBounds(spot, north_east, south_west)) {
        drawParkingSpot(spot);
        found_a_spot = true;
      }
      else {
        delete spot.marker;
      }
    }
    if (!found_a_spot) {
      flashError('Sorry Could not Find any spots, data is only available in SF.');
    }
  }

  var updateCurrentPosition = function(position) {
    current_position = {
      id: 'current_position',
      coords: position
    };

    addMarker(current_position,
      'http://maps.google.com/mapfiles/kml/pal4/icon47.png'
    );
  };

  var updateMap = function(position) {
    $('#loading-animation').hide();
    map.setCenter(position);
    updateCurrentPosition(position);
  }

  var onUserInput = function() {
    clearMap();
    var data = { 'address': $('#address').val() };
    geocoder.geocode(data, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        updateMap(results[0].geometry.location);
      }
      else {
        flashError(status)
      }
    });
  }

  var onPositionCoords = function(position) {
    position = new google.maps.LatLng(
      position.coords.latitude,
      position.coords.longitude
    );

    updateMap(position);
    geocoder.geocode({'latLng': position}, function(results, status) {
      if (status === google.maps.GeocoderStatus.OK) {
        $('#address').val(results[1].formatted_address);
      }
      else {
        flashError(status);
      }
    });
  }

  var initDefaults = function() {
    if (!navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(onPositionCoords);
    }
    else {
      onPositionCoords({
        coords: {
          latitude: 37.7908906,
          longitude: -122.3930944
        }
      })
    }
  }

  var initMap = function() {
    var mapOptions = {
      zoomControl: false,
      streetViewControl: false,
      panControl: false,
      mapTypeControl: false,
      zoom: 18
    };

    map = new google.maps.Map(
      document.getElementById('map-canvas'),
      mapOptions
    );

    $(document).on('click', "a.direction", drawDirections);
  }

  var initUserInput = function() {
    var address_input = $('#address');
    address_input.keyup(function(e) {
      var code = e.keyCode || e.which;
      if (code == 13) onUserInput();
    })

    address_input.on('focus', function (argument) {
      address_input.unbind('focus');
      address_input.val('');
    });
  }

  var initDirections = function() {
    return {
      service: new google.maps.DirectionsService(),
      display: new google.maps.DirectionsRenderer()
    };
  }

  var loadData = function(data, status) {
    $.get('/static/data/sf_bike_parking.json', function(data) {
      parking_spots = data;
      google.maps.event.addListener(map, 'bounds_changed', updateParkingSpots);
      updateParkingSpots();
    });
  };

  var current_position,
    parking_spots,
    current_info_window,
    geocoder = new google.maps.Geocoder(),
    map,
    popup_template = $('#popup-template').html();
    directions = initDirections();

  initMap(),
  initDefaults();
  initUserInput();
  loadData();
});



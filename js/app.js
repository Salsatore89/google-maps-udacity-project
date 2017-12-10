var locations = [{
        title: 'Museo de America',
        location: {
            lat: 40.439298,
            lng: -3.721899
        }
    },
    {
        title: 'Teatros del Canal',
        location: {
            lat: 40.440237,
            lng: -3.705039
        }
    },
    {
        title: 'Museo del Traje',
        location: {
            lat: 40.441347,
            lng: -3.729587
        }
    },
    {
        title: 'Plaza del Dos de Mayo',
        location: {
            lat: 40.427834,
            lng: -3.703966
        }
    },
    {
        title: 'Centro Cultural Conde Duque',
        location: {
            lat: 40.426951,
            lng: -3.711129
        }
    },
    {
        title: 'Museo Nacional del Romanticismo',
        location: {
            lat: 40.426231,
            lng: -3.698780
        }
    }
];

var Location = function(data) {
    this.title = ko.observable(data.title);
    this.location = ko.observable(data.location);
}

var ViewModel = function() {
    var self = this;
    // Get the associated marker from the clicked location and open infowindow
    self.setLocation = function(clickedLocation) {
        for (var i = 0; i < markers.length; i++) {
            if (clickedLocation.title == markers[i].title) {
                google.maps.event.trigger(markers[i], 'click');
            }
        }
    };
    // Filter the location list
    this.query = ko.observable('');
    this.filteredLocations = ko.computed(function() {
        if (this.query()) {
            var search = this.query().toLowerCase();
            return ko.utils.arrayFilter(locations, function(location) {
                return location.title.toLowerCase().indexOf(search) >= 0;
            }, filterMarkers(search));
        } else {
            filterMarkers();
            return locations;
        }
    }, this);
    // Filter the markers
    function filterMarkers(search) {
        if (arguments.length == 0) {
            for (var i = 0; i < markers.length; i++) {
                markers[i].icon = 'http://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png';
                markers[i].setVisible(true);
            }
        } else {
            for (var i = 0; i < markers.length; i++) {
                if (markers[i].title.toLowerCase().indexOf(search) < 0) {
                    markers[i].setVisible(false);
                } else {
                    markers[i].icon = 'http://maps.google.com/mapfiles/kml/pushpin/blue-pushpin.png';
                    markers[i].setVisible(true);
                }
            }
        }
    };
}

// Google maps section

var map;
// Create a new blank array for all the listing markers.
var markers = [];
function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 40.7413549,
            lng: -73.9980244
        },
        zoom: 14,
        mapTypeControl: false
    });
    var largeInfowindow = new google.maps.InfoWindow({
        maxWidth: 200
    });
    google.maps.event.addListener(map, "click", function(event) {
        largeInfowindow.close();
    });
    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < locations.length; i++) {
        // Get the position from the location array.
        var position = locations[i].location;
        var title = locations[i].title;
        // Create a var for holding the base url for the marker img
        var iconBase = 'http://maps.google.com/mapfiles/kml/pushpin';
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i,
            icon: iconBase + '/red-pushpin.png'
        });
        // Push the marker to our array of markers.
        markers.push(marker);
        // Create an onclick event to open an infowindow at each marker.
        marker.addListener('click', function() {
            populateInfoWindow(this, largeInfowindow);
        });
    }
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not opened for this marker.
    if (infowindow.marker != marker) {
        var wikiUrl = 'http://es.wikipedia.org/w/api.php?action=opensearch&search=' + marker.title + '&format=json&callback=wikiCallback';
        // Ajax request for wikipedia article on clicked location
        $.ajax({
            url: wikiUrl,
            dataType: 'jsonp'
        }).done(function(data) {
            var contentWiki = data[2][0];
            var urlWiki = data[3][0];
            if (contentWiki !== '') {
                infowindow.marker = marker;
                infowindow.setContent('<div>' + '<strong>' + marker.title + '</strong>' + '<p>' + contentWiki + ' <a href="' + urlWiki + '">' + ' ' + 'Know more' + '</a>' + '</p>' + '</div>');
                infowindow.open(map, marker);
            } else {
                infowindow.setContent('<div>' + '<strong>' + marker.title + '</strong>' + '<p>' + 'Wikipedia article couldn\'t be loaded, click the link instead' + '</p>' + ' <a href="' + urlWiki + '">' + ' ' + 'Know more' + '</a>' + '</div>');
                infowindow.open(map, marker);
            }
        }).fail(function() {
            infowindow.setContent('<div>' + '<strong>' + marker.title + '</strong>' + '<p>' + 'There was an error getting information from Wikipedia, try again later' + '</p>' + '</div>');
            infowindow.open(map, marker);
        });
    }
}

// Here we display an error message in case the map can't be loaded
function errorMap() {
    document.getElementById("map").innerHTML = "<h2> We couldn't load the map, try again later. </h2>";
};



ko.applyBindings(new ViewModel());

var map = L.map('map');

$(window).on("resize", function () { $("#map").height($(window).height()); map.invalidateSize(); }).trigger("resize");


$(document).ready(function() {
    console.log(localStorage.getItem('Shapefile'));
    map.setView([16.809141, 96.156120], 6);
    var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    mapLink =
        '<a href="http://www.esri.com/">Esri</a>';
    wholink =
        'i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community';
   var esriLayer = L.tileLayer(
        'http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
           attribution: '&copy; ' + mapLink + ', ' + wholink,
           maxZoom: 18,
       });

    var coords = localStorage.getItem('coordinates');
    console.log(coords._latlngs);


    var baseMaps = {
        "OSM": osmLayer,
        "ESRI": esriLayer
    };


    L.control.layers(baseMaps).addTo(map);

    if(localStorage.getItem("Shapefile") == null){
        document.getElementById('ShapeFile').innerHTML = 'No Shapefile Uploaded'
    } else {
        document.getElementById('ShapeFile').innerHTML = 'Your actually used Shapefile is: ' + localStorage.getItem("Shapefile");
    }

    checkShape();
});

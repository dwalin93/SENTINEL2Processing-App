/**
 * Created by pglah on 23.10.2017.
 */

var map = L.map('map');

$(window).on("resize", function () { $("#map").height($(window).height()); map.invalidateSize(); }).trigger("resize");


$( document ).ready(function() {
    console.log(localStorage.getItem('ShapeFile'));
    map.setView([16.809141, 96.156120], 6);
    var osmLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

    if(localStorage.getItem("Shapefile") == null){
        document.getElementById('ShapeFile').innerHTML = 'No Shapefile Uploaded'
    } else {
        document.getElementById('ShapeFile').innerHTML = 'Your actually used Shapefile is: ' + localStorage.getItem("Shapefile");
    }

    checkShape();
});

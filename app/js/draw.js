/**
 * Created by pglah
 */
// Initialise the FeatureGroup to store editable layers
var convertedCoordArray = [];
var result;
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);


/**
 * Enables the user to draw certain features on the map
 * @type {{edit: {featureGroup: *}, draw: {polyline: {shapeOptions: {color: string}}, polygon: {showArea: boolean, allowIntersection: boolean, drawError: {color: string, message: string}, shapeOptions: {color: string}}, circle: {shapeOptions: {color: string}}, rectangle: {shapeOptions: {color: string}}}}} draw options
 */
var drawOptions = {
    edit: {
        featureGroup: drawnItems
    },
    draw: {
        polyline: false,
        polygon:false,
        circle: false,
        marker:false,
        rectangle: {
            shapeOptions: {
                color: '#4c4cff'
            }
        }
    }
};


var editOnly = {
    edit: {
        featureGroup: drawnItems
    },
    draw: false
};




var drawControl = new L.Control.Draw(drawOptions);
var drawControlEditOnly = new L.Control.Draw(editOnly);
L.drawLocal.draw.toolbar.buttons.rectangle = 'Show the area you are interested in.';


map.addControl(drawControl);


// if a shape is drawn, add it to the layer
map.on('draw:created', function (e) {
    var layer = e.layer;
    layer.addTo(drawnItems);
    localStorage.setItem('coordinates',drawnItems);
    drawControl.remove(map);
    drawControlEditOnly.addTo(map);
});

map.on('draw:deleted', function (e){
    check = drawnItems.getLayers().length;
    if(check===0){
        drawControlEditOnly.remove(map);
        drawControl.addTo(map);
    }
});


    map.on('draw:created', function (e) {
        var layer = e.layer;
        console.log(layer);
        localStorage.setItem('coordinates',layer);
        var latlon = layer.toGeoJSON();
        var coordArray = [];
        coordArray.push(latlon.geometry.coordinates);
       var concat = concatArray(coordArray);
       var round = round2DecimalDeg(concat);
       convertedCoordArray = covertArrayToCopernicusSyntax(round);
       localStorage.setItem('convertedCoordArray',convertedCoordArray);




    });

    function concatArray(array){
        var concat = array[0][0][0].concat(array[0][0][1].concat(array[0][0][2].
        concat(array[0][0][3].concat(array[0][0][4]))));

        return concat;
    }

    function round2DecimalDeg(array){
        var newArray = array.map(function(each_element){
            return Number(parseFloat(each_element).toFixed(2));
        });

        return newArray;
    }

    function covertArrayToCopernicusSyntax(array){
        var array2String = array.toString();
        var split = array2String.split(',');


        var slice1 = split.slice(0,2);
        var slice2 = split.slice(2,4);
        var slice3 = split.slice(4,6);
        var slice4 = split.slice(6,8);
        var slice5 = split.slice(8,10);

        var replace1 = slice1.toString().replace(",", " ");
        var replace2 = slice2.toString().replace(",", " ");
        var replace3 = slice3.toString().replace(",", " ");
        var replace4 = slice4.toString().replace(",", " ");
        var replace5 = slice5.toString().replace(",", " ");

        result = replace1 + "," + replace2 + "," + replace3 + "," + replace4 + "," + replace5;
        return result;
    }




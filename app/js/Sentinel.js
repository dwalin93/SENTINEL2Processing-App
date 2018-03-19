/**
 * Initial function to look for Sentinel Images
 */
function getSentinelData(){
    var url = encodeURI('/getSentinel?');
    console.log('hier1');
    $.ajax({
        type: 'GET',
        url:  url,
        contentType: 'application/json; charset=utf-8',
        dataType:'json',
        timeout:5000,
        data: {
            data: localStorage.getItem('convertedCoordArray')
        },
        success: function(data,status){
            console.log('Content retreived from Copernicus API');
           // var converted = xmlToJson(data);
            console.log(data)
            var parsed = JSON.parse(JSON.stringify(data));
            console.log(parsed)
            console.log(parsed.feed["opensearch:totalResults"]);
            if(parsed.feed["opensearch:totalResults"]!='0') {
                var ID = extractID(parsed);
                var Name = extractName(parsed);
                console.log(Name);
                downloadSentinelData(ID, Name);
               // ProcessImages();
                //test();
            } else {
                alert('No data found in that Region');
            }
            //test();


        },
        error: function (errorMessage) {
        }
    });
}

/**
 * Calls the /downloadSentinel route to download images
 * @param ID of downloaded images
 * @param Name of downloaded images
 */
function downloadSentinelData(ID,Name){
    var url = encodeURI('/downloadSentinel?');
    $.ajax({
        type: 'GET',
        url:  url,
        dataType:'json',
        data: {
            data: ID,
            name: Name
        },
        success: function(data,status){
            console.log(data);
            console.log(status);
            alert('Products downloaded. Processing now.');
            if (localStorage.getItem('Shapefile') !=''){
                ProcessImages();
            }
        },
        error: function (errorMessage) {
        }
    });
}

/**
 * Gets the Tiles from specified date
 * @param date from jQuery datepicker
 */
function getTilesOnDate(date){
    var url = encodeURI('/getTilesOnDate');
    console.log('hier1');
    $.ajax({
        type: 'GET',
        url:  url,
        contentType: 'application/json; charset=utf-8',
        dataType:'json',
        timeout:5000,
        data:{
            coordinates: localStorage.getItem('convertedCoordArray'),
            date:date
        },
        success: function(data,status){
            console.log('Content retreived from Copernicus API');
            var parsed = JSON.parse(JSON.stringify(data));
            console.log(parsed)
            if(parsed.feed["opensearch:totalResults"]!='0') {
            var coordinates = getTileCoordinates(parsed);
            var names = getTileNames(parsed);
            console.log(coordinates);
            var geoJSON = createGeoJSON(coordinates,names);
            console.log(geoJSON)
            addDataToMap(geoJSON,map);

        } else {
                alert('No data present in the Copernicus API Hub for that specific date')
            }
        },
        error: function (errorMessage) {
        }
    });
}

/**
 * If clicked on feature tie, show the corresponding image
 * @param feature a Single Tile
 * @param layer all Tiles
 */
function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindTooltip(feature.properties.name.substring(38,44));
        layer.on('click', function () {
            console.log(feature.geometry.coordinates)
            localStorage.setItem('mapcoords',feature.geometry.coordinates);
            if($('#datepicker1').datepicker('getDate') !=null) {
                enableDatepicker();
                getImage(feature.properties.name, feature.properties.name.substring(38, 44),'#datepicker1');

            }
            if($('#datepicker2').datepicker('getDate') !=null) {
                getImage(feature.properties.name, feature.properties.name.substring(38, 44),'#datepicker2');

            }


        })
           // getImage(feature.properties.name);
            //enableDatepicker();
    }
}

/**
 * Adds the found tiles to the map
 * @param data
 * @param map
 */
function addDataToMap(data, map) {
   var feature = L.geoJson(data, {
        onEachFeature: onEachFeature
    }).addTo(map);

feature.on('click', function () {
    feature.clearLayers();

})

}

/**
 * Gets each Product ID from the json received
 * @param JSONFile
 * @returns {Array.<*>}
 */
function extractID(JSONFile){
    console.log(JSONFile)
    var result = [];

    for (i=0;i<JSONFile.feed.entry.length;i++){
        var name = JSONFile.feed.entry[i].id;
        result.push(name);
    }

    console.log(result);
    var dublicates = [];
    var array = result.filter(function(el) {
        // If it is not a duplicate, return true
        if (dublicates.indexOf(el) == -1) {
            dublicates.push(el);
            return true;
        }

        return false;

    });

    return array;
}

/**
 * Get each product name from received JSON
 * @param JSONFile
 * @returns {Array.<*>}
 */
function extractName(JSONFile){
    var result = [];

    for (i=0;i<JSONFile.feed.entry.length;i++){
        var name = JSONFile.feed.entry[i].title;
        result.push(name);
    }

    var dublicates = [];
    var array = result.filter(function(el) {
        // If it is not a duplicate, return true
        if (dublicates.indexOf(el) == -1) {
            dublicates.push(el);
            return true;
        }

        return false;

    });

    return array;
}

/**
 * Gets coordinates from JSON
 * @param JSONFile
 * @returns {*}
 */
function getTileCoordinates(JSONFile){
    var result = [];


    for (i=0;i<JSONFile.feed.entry.length;i++){
        var coordinates = JSONFile.feed.entry[i].str[7].content;
        result.push(coordinates);
    }
    var convertedCoordinates = getCoordsForMap(result);

    return convertedCoordinates;
}

/**
 * Get the names of each feature for the Tiles
 * @param JSONFile
 * @returns {Array}
 */
function getTileNames(JSONFile){
    var result = [];

    for (i=0;i<JSONFile.feed.entry.length;i++){
        var names = JSONFile.feed.entry[i].title;
        result.push(names);
    }
    var NamesForPopup=[];
    for(i=0;i<result.length;i++) {
        NamesForPopup[i] = result[i].split(',');
    }

    return NamesForPopup;

}

/**
 * Transform coordinates in Leaflet coordinates
 * @param data
 * @returns {Array}
 */
function getCoordsForMap(data){
   var String = data.toString();
       var replace1 = String.replace(/POLYGON \(\(/g,'[[');
        var replace2 = replace1.replace(/\)\)/g, ']]');
        var replace3 = replace2.replace(/,/g,'],[');
        var replace4 = replace3.replace(/ /g, ',');
        var replace5 = replace4.replace(/\[\[\[/g,'[[');
        var replace6 = replace5.replace(/\]\]\]/g,']]');
        console.log(replace6)
        var arrayForCoords = (replace6).split(/,(?=\[\[)/g);

        return arrayForCoords;


}

/**
 * Creates a GeoJSON including coordinates and name of each feature
 * @param coordinates
 * @param names
 * @returns {string}
 */
function createGeoJSON(coordinates,names){
    var geoJSON = '{ "type": "FeatureCollection", "features":[ ';
    for(i=0;i<coordinates.length;i++){
        var feature = '{ "type": "Feature",' +
            '"geometry": {"type": "Polygon",' +
            '"coordinates": [' + coordinates[i] +
            ']},"properties": {"name": ' +'"' + names[i] +'"' +
            '}},'

        geoJSON+=feature;
    }

    geoJSON = geoJSON.substring(0, geoJSON.length - 1);
    geoJSON += ']}';
    console.log(geoJSON)
    geoJSON = JSON.parse(geoJSON);
    return geoJSON;
}



var downloadData = L.easyButton('fa-globe', function(){
        map.on('click', getSentinelData());
    },
    'get Sentinel Data'
).addTo(map);


/**
 * Enables the download button if a Shapefile was uploaded
 */
var checkShape = function () {
    if (localStorage.getItem('Shapefile') != null){
        downloadData.enable();
    } else {
        downloadData.disable();
        map.on('click', function () {
            alert('Please upload a Shapefile first.');
        })


    }
}

window.setInterval(function(){
    checkShape();
}, 1000);


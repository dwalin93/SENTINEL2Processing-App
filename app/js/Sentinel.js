/**
 * Created by pglah on 23.10.2017.
 */
function GDAL_Translate(){
    var url = encodeURI('/GDAL_Translate');
    console.log('hier1');
    $.ajax({
        type: 'POST',
        url:  url,
        timeout:5000,
        success: function(data,status){
            console.log('GDAL Translated jp2 to png')

        },
        error: function (errorMessage) {
        }
    });
}


function MoveImages(){
    var url = encodeURI('/moveImage');
    console.log('hier1');
    $.ajax({
        type: 'POST',
        url:  url,
        timeout:5000,
        success: function(data,response){
            console.log(data);

        },
        error: function (errorMessage) {
        }
    });
}

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
                console.log(ID);
                downloadSentinelData(ID, Name);
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

function downloadSentinelData(ID,Name){
    console.log(ID);
    var url = encodeURI('/downloadSentinel?');
    $.ajax({
        type: 'GET',
        url:  url,
        timeout:5000,
        async: false,
        data: {
            data: ID,
            name: Name
        },
        success: function(data,status){
            console.log('Content retreived from Copernicus API');
            if (localStorage.getItem('Shapefile') !=''){
                ProcessImages();
            }
        },
        error: function (errorMessage) {
        }
    });
}

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
            //var converted = xmlToJson(data);
            //console.log(converted)
            var parsed = JSON.parse(JSON.stringify(data));
            console.log(parsed)
            var coordinates = getTileCoordinates(parsed);
            var names = getTileNames(parsed);
            console.log(coordinates);
            var geoJSON = createGeoJSON(coordinates,names);
            console.log(geoJSON)
            addDataToMap(geoJSON,map);

        },
        error: function (errorMessage) {
        }
    });
}

function onEachFeature(feature, layer) {
    if (feature.properties && feature.properties.name) {
        layer.bindTooltip(feature.properties.name.substring(38,44));
        layer.on('click', function () {
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
function addDataToMap(data, map) {
   var feature = L.geoJson(data, {
        onEachFeature: onEachFeature
    }).addTo(map);

feature.on('click', function () {
    feature.clearLayers();

})

}


function extractID(JSONFile){
    var result = [];

    for (i=0;i<JSONFile.feed.entry.length;i++){
        var name = JSONFile.feed.entry[i].id;
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

function getTileCoordinates(JSONFile){
    var result = [];


    for (i=0;i<JSONFile.feed.entry.length;i++){
        var coordinates = JSONFile.feed.entry[i].str[7].content;
        result.push(coordinates);
    }
    var convertedCoordinates = getCoordsForMap(result);

    return convertedCoordinates;
}

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

function swapCoordinates(array){
    array.forEach(function(arr) {
        arr.forEach(function(e, i) {
            const a = e[0]
            e[0] = e[1]
            e[1] = a;
        })
    })

    return array;
}

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


var checkShape = function () {
    if (localStorage.getItem('ShapeFile') != null){
        downloadData.enable();
    } else {
        downloadData.disable();
        map.on('click', function () {
            alert('Please upload a Shapefile first.');
        })


    }
}


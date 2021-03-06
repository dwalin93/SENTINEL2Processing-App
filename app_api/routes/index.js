/**
 * Created by pglah on 23.10.2017.
 */
var express = require('express');
var app = express.Router();
var request = require('request');
var fs = require('fs-extra')
var unzip = require('unzip');
var async = require('async');



app.get('/#', function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});

/**
 * Sends Request to Copernicus Api to receive products
 */
app.get('/getSentinel', function (req,res){
    var promObj = {};
    console.log('hallo');
   promObj['coordinates'] = req.query.data;


    var url_search="https://scihub.copernicus.eu/dhus/search?q=";

    auth = {
        'user': 'dwalin93',
            'pass': 'Charly09',
            'sendImmediately': false
    };

    request(url_search + 'footprint:"Intersects(POLYGON(('+promObj.coordinates+')))" AND platformname:Sentinel-2 AND ingestiondate:[NOW-14DAYS TO NOW] ' + '&rows=100' + '&orderby=beginposition desc&format=json',{auth: auth},function(error, response, body) {
            console.log(body);
            res.send(body);


    });
});

/**
 * Route to Download the received data from Copernicus API
 * Calls function fownloadSentinel
 */
app.get('/downloadSentinel', function (req,res){
    var promObj = {};
    console.log('halloDownload');
    var data = req.query.data;
    var Name = req.query.name;
    namesArray = [];
    for(var i =0;i<Name.length;i++){
        namesArray.push(Name[i]);
    }
    promObj['Name'] = namesArray;
    console.log(promObj.Name);


    requestarray = [];
    for (i=0; i<data.length;i++) {
        requestarray.push(data[i]);
        promObj['requestURLS'] = requestarray;
    }

   createResultFolder(promObj)
       .then(downloadSentinel)
    .then(resp => {
        console.log("THEN:", resp);
        res.send(resp);
        res.end();
    }).catch((err) => {
        console.log("CATCH:", err);
       res.send(err);

    })


});

/**
 * Gets tiles on specified date from Copernicus API
 */
app.get('/getTilesOnDate', function (req,res) {
    var promObj = {};
    promObj['date'] = req.query.date;
    promObj['coordinates'] = req.query.coordinates;

    var url_search = "https://scihub.copernicus.eu/dhus/search?q=";

    auth = {
        'user': 'dwalin93',
        'pass': 'Charly09',
        'sendImmediately': false
    };

    request(url_search + 'footprint:"Intersects(POLYGON((' + promObj.coordinates + ')))" AND platformname:Sentinel-2 AND beginposition:[' + promObj.date + 'T00:00:00.000Z TO ' + promObj.date + 'T23:59:59.999Z] ' + '&rows=100' + '&orderby=beginposition desc&format=json', {auth: auth}, function (error, response, body) {
        console.log(body);
        res.send(body);


    });

});

/**
 * Function to create data folder
 * @param promObj
 * @returns {Promise}
 */
function createResultFolder(promObj) {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirs('./data', function(err) {
                if (err) return console.error(err);
            });
            fs.mkdirsSync('./app/data');
            resolve(promObj)
            console.log("Ordner ist erstellt")
        } catch (error) {
            reject(error)
        }
    })
}

/**
 * Function calling the bash script to download products
 * @param promObj
 * @returns {Promise}
 */
function downloadSentinel(promObj){
        return new Promise((resolve,reject) =>{
            var sys = require('util'),
                exec = require('child_process').exec,
                child;

            var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));

            var urls = parseArrayForBash(promObj.requestURLS);
            var names = parseArrayForBash(promObj.Name);
            console.log(names);

            if (process.platform === "win32") {
                console.log("executing:", directory + '\\downloadProducts.sh ' + urls + ' ' + names);
                child = exec(directory + '\\downloadProducts.sh '+ urls + ' ' + names);

                child.on("error", function (error) {
                    console.log("child error:", error);
                    reject(promObj)
                })

                child.on('data', function (data) {
                    console.log(data.toString());

                });

                child.on('exit', function (exit) {
                    console.log("child exit:", exit);
                    resolve(promObj);
                })

                child.stderr.pipe(process.stderr);
                child.stdout.pipe(process.stdout);

            } else {
                console.log("executing:", './downloadProducts.sh ' + urls + ' ' + names);
                child = exec('bash downloadProducts.sh '+ urls + ' ' + names, [{stdio:'inherit'}]);

                child.stderr.pipe(process.stderr);
                child.stdout.pipe(process.stdout);

                child.on("error", function (error) {
                    console.log("child error:", error);
                    reject(promObj)
                })

                child.on('data', function (data) {
                    console.log(data.toString());

                });

                child.on('exit', function (exit) {
                    console.log("child exit:", exit);
                    resolve(promObj);
                })
            }
        })
}

/**
 * Parses Array for use in bash
 * @param array
 * @returns {*}
 */
function parseArrayForBash(array){
    var replaceComma = JSON.stringify(array).replace(/,/g,' ');
    var replaceBracketsOpen = replaceComma.replace(/\[/g,'(');
    var replaceBracketsClose = replaceBracketsOpen.replace(/]/g,')');
    result = JSON.stringify(replaceBracketsClose);

    return result;
}
/**
 * Unused function to download products only with node, does not work
 * @param promObj
 * @param req
 * @param res
 */
function downloadSentinelAsync(promObj,req,res) {
         async.eachOfSeries(promObj.requestURLS,function (value,i,callback) {
            makeRequest(value,i,function (err,value) {
                if (err) return callback(err);
                callback(null, value);
            })
         }, function (err) {
            if (err) console.log('error')
            else {
                console.log('Done');
            }
        });

         }

function makeRequest(url, i, callback) {
    var sys = require('util'),
        exec = require('child_process').spawn,
        child;

    var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));

    console.log("executing:", directory + '\\downloadProducts.sh2 ' + url + ' ' + namesArray[i]);
    if (process.platform === "win32") {
        child = exec(directory + '\\downloadProducts2.sh ', [url, namesArray[i]], {shell: true});
        child.on("error", function (error) {
            console.log("child error:", error);

        })

        child.stdout.on('data', function (data) {
            console.log(data.toString());

        });

        child.on('exit', function (exit) {
            console.log("child exit:", exit);
            callback(exit);

        })
    } else {
        child = exec('bash downloadProducts2.sh ', [url, namesArray[i]], {shell: true});
        child.on("error", function (error) {
            console.log("child error:", error);

        })

        child.stdout.on('data', function (data) {
            console.log(data.toString());

        });

        child.on('exit', function (exit) {
            console.log("child exit:", exit);
            callback(exit);

        })
    }
}

module.exports = {
    app:app,
    parseArrayForBash:parseArrayForBash
};


//module.exports = app;
/**
 * Created by pglah on 23.10.2017.
 */
var express = require('express');
var app = express.Router();
var request = require('request');
var fs = require('fs-extra')
var rp = require('request-promise');
var unzip = require('unzip');
var progress = require('request-progress');
var async = require('async');
var proccessing = require('./proccessing');


var namesArray = [];




app.get('/#', function (req, res) {
    res.sendFile(__dirname + '/app/index.html');
});


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

    request(url_search + 'footprint:"Intersects(POLYGON(('+promObj.coordinates+')))" AND platformname:Sentinel-2 AND ingestiondate:[NOW-7DAYS TO NOW] ' + '&rows=100' + '&orderby=beginposition desc&format=json',{auth: auth},function(error, response, body) {
            console.log(body);
            res.send(body);


    });


    //console.log(req);


});

app.get('/downloadSentinel', function (req,res){
    var promObj = {};
   // url_search = 'https://scihub.copernicus.eu/dhus/odata/v1/Products';
    console.log('halloDownload');
    console.log('HIEEEEER DATEN ' + req.query.data[0]);
    var data = req.query.data;
    var Name = req.query.name;
    for(var i =0;i<Name.length;i++){
        namesArray.push(Name[i]);
    }
    promObj['Name'] = Name;
    console.log(namesArray);

        // var result = getRequestedTiles(data);
    //console.log(req);
    requestarray = [];
    for (i=0; i<data.length;i++) {
        requestarray.push(data[i]);
        promObj['requestURLS'] = requestarray;
    }


   //requestarray = ['https://scihub.copernicus.eu/dhus/odata/v1/Products(\'0204ea67-6033-47e8-b20f-26852c63cd45\')/$value'];

   //promObj['requestURLS'] = ['https://scihub.copernicus.eu/dhus/odata/v1/Products(\'0204ea67-6033-47e8-b20f-26852c63cd45\')/$value'];
   console.log(promObj.requestURLS);

   createResultFolder(promObj)
   //downloadSentinel(promObj);
  // res.end('FINISHED DOWNLOAD');

    downloadSentinelSync(promObj);
   req.setTimeout(0);
   console.log('Finished download')
    //res.status(200).send()
       //unZIP('./test/','./test');

});


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

    request(url_search + 'footprint:"Intersects(POLYGON((' + promObj.coordinates + ')))" AND platformname:Sentinel-2 AND ingestiondate:[' + promObj.date + 'T00:00:00.000Z TO ' + promObj.date + 'T23:59:59.999Z] ' + '&rows=100' + '&orderby=beginposition desc&format=json', {auth: auth}, function (error, response, body) {
        console.log(body);
        res.send(body);


    });

});

function createResultFolder(promObj) {
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirs('./data', function(err) {
                if (err) return console.error(err);
            });
            fs.mkdirsSync('./data');
            resolve(promObj)
            console.log("Ordner ist erstellt")
        } catch (error) {
            reject(error)
        }
    })
}

function downloadSentinelSync(promObj){
        try {
            var sys = require('util'),
                exec = require('child_process').execSync,
                child;

            var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));

            var urls = parseArrayForBash(promObj.requestURLS);
            var names = parseArrayForBash(promObj.Name);

            if (process.platform === "win32") {
                console.log("executing:", directory + '\\downloadProducts.sh ' + urls + ' ' + names);
                child = exec(directory + '\\downloadProducts.sh ' + urls + ' ' + names);


                child.on("error", function (error) {
                    console.log("child error:", error);
                })

                child.stdout.on('data', function (data) {
                    process.stdout.write(data);

                });

                child.on('disconnect', function (exit) {
                    console.log("child exit:", exit);

                })

            } else {
                console.log("executing:", './downloadProducts.sh ' + urls + ' ' + names);
                child = exec('bash downloadProducts.sh ' + urls + ' ' + names);


                child.on("error", function (error) {
                    console.log("child error:", error);
                })

                child.stdout.on('data', function (data) {
                    process.stdout.write(data);

                });

                child.on('disconnect', function (exit) {
                    console.log("child exit:", exit);

                })



            }
        }
        catch
            (err)
            {
                return (err);
            }

}

function parseArrayForBash(array){
    var replaceComma = JSON.stringify(array).replace(/,/g,' ');
    var replaceBracketsOpen = replaceComma.replace(/\[/g,'(');
    var replaceBracketsClose = replaceBracketsOpen.replace(/]/g,')');
    result = JSON.stringify(replaceBracketsClose);

    return result;
}

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
    child = exec(directory + '\\downloadProducts2.sh ',[url,namesArray[i]],{shell:true});
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

function downloadSentinel(promObj) {

    return new Promise((resolve, reject) => {
        function makeRequest(url, i, callback) {
            var sys = require('util'),
                exec = require('child_process').spawn,
                child;

            var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));

            console.log("executing:", directory + '\\downloadProducts.sh ' + promObj.requestURLS[i] + ' ' + promObj.Name[i]);
            var child = exec(directory + '\\downloadProducts.sh ',[url,promObj.Name[i]],{shell:true});

            child.stdout.on('data', function (data) {
                console.log("IM HERE");
                console.log('data' + data);
            });

            child.stderr.on('data', function (data) {
                console.log("IM HERE - Error");
                console.log('test: ' + data);
            });

            child.on('disconnect', function (code) {
                console.log("IM HERE");
                console.log("close");
                callback();
            });

            child.stdout.pipe(process.stdout)
            child.stderr.pipe(process.stderr)
        }

        async.eachOfLimit(promObj.requestURLS, 2, makeRequest, function (err) {
            if (err) reject(promObj)
            else {
                resolve(promObj);
            }
        });
    });
}





app.post('/moveImage', function (req, res, next) {
try {

    var sys = require('util'),
        exec = require('child_process').execSync,
        child;

    var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));
    console.log(directory);

    child = exec(directory + '\\movingImage.sh', function (error, stdout, stderr) {

        if (error) // There was an error executing our script
        {
            return next(error);
        }


        return res.status(200).send(stdout); // Show output in this case the success message
    });

} catch(err){
    console.log(err);
}
});


app.post('/GDAL_Translate', function (req, res, next) {

return new Promise((resolve,reject) =>{
    try{
    var sys  = require('util'),
        exec = require('child_process').execSync,
        child;

    var directory = __dirname.substring(0,__dirname.indexOf("\\app_api"));
    console.log(directory);

    child = exec(directory + '\\GDAL_Translate.sh', function (error, stdout, stderr)
    {

        if (error) // There was an error executing our script
        {
            reject();
            return next(error);
        }



    });
    resolve(res);
    res.send('MOVED IMAGES')
} catch(err){
    reject(res)}
})
})



function unZIP(path,dest,promObj) {
    return new Promise((resolve, reject) => {
        try {
            var files = fs.readdirSync(path);
            console.log(files)
            for (i = 0; i < files.length; i++) {
                console.log(files[i].split('.').pop())
                if (files[i].split('.').pop() == 'zip') {
                    fs.createReadStream(path + files[i]).pipe(unzip.Extract({path: dest}));
                    resolve(promObj);
                }

            }
        } catch (error){
            reject(error)
        }
    })
}

function test() {
    var sys = require('util'),
        exec = require('child_process').spawn,
        child;

    var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));


    console.log("executing:", directory + '\\downloadProducts2.sh ' + 'S2A_MSIL1C_20180220T040811_N0206_R047_T46QGH_20180220T074755' + ' ' + '66214563-164f-4b5c-9329-f47d9afdf58b');
    child = exec(directory + '\\downloadProducts2.sh ',['66214563-164f-4b5c-9329-f47d9afdf58b','S2A_MSIL1C_20180220T040811_N0206_R047_T46QGH_20180220T074755'],{shell:true});
    child.on("error", function (error) {
        console.log("child error:", error);

    })

    child.stdout.on('data', function (data) {
        console.log(data.toString());

    });

    child.on('beforeExit', function (exit) {
        console.log("child exit:", exit);
        callback(exit);

    })
}

module.exports = app;

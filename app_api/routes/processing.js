/**
 * Created by pglah on 05.03.2018.
 */
var express = require('express');
var app = express.Router();
var request = require('request');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');





app.post('/uploadShapeFile', function (req,res){
    console.log(req.files.originalname);
    res.send('uploaded Shapes');
});

app.post('/processImages', function (req,res) {
    console.log(req.body);
    var promObj = {}
    promObj['Shapefile'] = req.body.shapefile;
    promObj['names'] = getImagesNames('./app/data/');

    console.log(promObj.Shapefile);

    console.log(promObj.names[0].toString().substring(8,10));
            unZIP('./app/data/','./app/data',promObj)
            .then(moveImage)
            .then(GDALTranslate)
            .then(processSentinel)
            .then(calcNDVI)
            .then((res) => {
        console.log("THEN:", res.status(200).end())
    }).catch((err) => {
        console.log("CATCH:", err)
    })


})

function calcNDVI(promObj){
    console.log('I am now in calcNDVI');
    return new Promise((resolve,reject) => {
        function NDVI(name,callback) {
            var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/calcNDVI';
            if (name.toString().substring(8, 10) == '1C') {
                var formData = {
                    NIR: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    Red: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    shapeLink: fs.createReadStream('./shapefiles/' + promObj.Shapefile + '.shp')
                }
            } else {
                var formData = {
                    NIR: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    Red: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    shapeLink: fs.createReadStream('./shapefiles/' + promObj.Shapefile + '.shp')
                }
            }

            console.log('calculating NDVI');
            request.post({
                url: url,
                formData: formData
            }, function optionalCallback(err, response, body,cb) {
                err = err || (response && (response.statusCode === 400 ||
                    response.statusCode === 502 ||
                    response.statusCode === 503) && response.statusCode);
                console.log(err);
                if (!err) {
                    result = [];
                    var String = body.toString();
                    var sub = String.substring(10, 21);
                    console.log(sub);
                    promObj["tempLoc"] = sub;
                    console.log('I was here');
                    if (name.toString().substring(8, 10) == '1C') {
                        var path = '/IMG_DATA/'
                    } else {
                        var path = '/IMG_DATA/R10m/'
                    }
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png', function (err, response, body) {
                    })
                        .pipe(fs.createWriteStream('./app/data/' + name + path + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_FCC.png'))
                            .on('finish', () => {
                                console.log(name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_NDV.png' + "saved");
                                callback();
                            });
                    }


            })


        }
            async.eachSeries(promObj.names, NDVI, function (err) {
                if (err) reject(promObj);
                else {
                    resolve(promObj);
                }
            });

    })
}

function processSentinel(promObj){
    return new Promise((resolve,reject) => {
        function FalseColorComposite(name,callback) {
            var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/FCC';
            if (name.toString().substring(8, 10) == '1C') {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B02.png')
                }
            } else {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B02.png')
                }
            }
            request.post({
                url: url,
                formData: formData
            }, function optionalCallback(err, response, body) {
                err = err || (response && (response.statusCode === 400 ||
                    response.statusCode === 502 ||
                    response.statusCode === 503) && response.statusCode);
                if (!err) {
                    result = [];
                    var String = body.toString();
                    var sub = String.substring(10, 21);
                    console.log(sub);
                    promObj["tempLoc"] = sub;
                    console.log('I was here');
                    if (name.toString().substring(8, 10) == '1C') {
                        var path = '/IMG_DATA/'
                    } else {
                        var path = '/IMG_DATA/R10m/'
                    }
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png', function (err, response, body) {
                    })
                        .pipe(fs.createWriteStream('./app/data/' + name + path + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_FCC.png'))
                        .on('finish', () => {
                            console.log(name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_FCC.png' + "saved");
                            callback();
                        });
                }


            })


        }
        async.eachSeries(promObj.names, FalseColorComposite, function (err) {
            if (err) reject(promObj);
            else {
                resolve(promObj);
            }
        });

    })
}

function moveImage(promObj){
    return new Promise((resolve, reject) => {
        try {

            var sys = require('util'),
                exec = require('child_process').execSync,
                child;

            var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));
            console.log(directory);

            if (process.platform === "win32") {
                child = exec(directory + '\\movingImage.sh', function (error, stdout, stderr) {

                    if (error) // There was an error executing our script
                    {
                        reject(error);
                        return next(error);

                    }


                    child.on('exit', function (exit) {
                        console.log("child exit:", exit);
                        resolve(res);
                        res.send('Moved images')
                    })
                });
            } else {
                child = exec('bash ./movingImage.sh', function (error, stdout, stderr) {

                    if (error) // There was an error executing our script
                    {
                        return next(error);
                    }


                    child.on('exit', function (exit) {
                        console.log("child exit:", exit);
                        resolve(promObj);
                        res.send('Moved images')
                    }) // Show output in this case the success message
                });
            }
        } catch (err) {
            console.log(err);
        }
    });
}



function GDALTranslate(promObj){
    return new Promise((resolve,reject) =>{
        try{
            var sys  = require('util'),
                exec = require('child_process').execSync,
                child;

            var directory = __dirname.substring(0,__dirname.indexOf("\\app_api"));
            console.log(directory);

            if (process.platform === "win32") {
                child = exec(directory + '\\GDAL_Translate.sh', function (error, stdout, stderr) {

                    if (error) // There was an error executing our script
                    {
                        reject();
                        return next(error);
                    }

                    child.on('exit', function (exit) {
                        console.log("child exit:", exit);
                        resolve(res);
                        res.send('Moved images')
                    })

                });
            } else {
                child = exec('bash GDAL_Translate.sh', function (error, stdout, stderr) {

                    if (error) // There was an error executing our script
                    {
                        reject();
                        return next(error);
                    }

                    child.on('exit', function (exit) {
                        console.log("child exit:", exit);
                        resolve(promObj);
                        res.send('Moved images')
                    })

                });
            }

        } catch(err){
            reject(res)}
    })
}



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
                else{
                    resolve(promObj);
                }

            }
        } catch (error){
            reject(error)
            console.log(error);
        }
    })
}


function getImagesNames(path){
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}

module.exports = app;
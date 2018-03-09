/**
 * Created by pglah on 05.03.2018.
 */
var express = require('express');
var app = express.Router();
var request = require('request');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
var unzip = require('unzip');





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
            createResultFolder(promObj)
            .then(unZIP('./app/data/','./app/data'))
            .then(moveImage)
            .then(GDALTranslate)
            .then(processSentinel)
            .then((res) => {
        console.log("THEN:", res)
                res.send();
    }).catch((err) => {
        console.log("CATCH:", err)
                err.send();
    })


})

app.get('/compareNDVI', function (req,res) {
    console.log(req.query);
    var promObj = {};

    promObj['leftImage'] = req.query.left;
    promObj['rightImage'] = req.query.right;

    compareNDVI(promObj)
        .then((res) => {
            console.log("THEN:", res)
        }).catch((err) => {
        console.log("CATCH:", err)
    })
})

function processSentinel(promObj) {
    return new Promise((resolve, reject) =>{
        Promise.all([createFCC(promObj), calcNDVI(promObj)])
            .then(() =>{
                resolve(promObj);
            }).catch((err) =>{
            reject(err);
        })
    })
}

function calcNDVI(promObj){
    console.log('I am now in calcNDVI');
    return new Promise((resolve,reject) => {
        function NDVI(name,callback) {
            var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/calcNDVI';
            if (name.toString().substring(8, 10) == '1C') {
                var formData = {
                    NIR: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    Red: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    shapeLink:'"/home/p_glah01/SentinelApp/SENTINEL2Processing-App/'+'shapefiles/' + promObj.Shapefile + '.shp"'
                }
            } else {
                var formData = {
                    NIR: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    Red: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    shapeLink: '"/home/p_glah01/SentinelApp/SENTINEL2Processing-App/'+'shapefiles/' + promObj.Shapefile + '.shp"'
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
                console.log(body);
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
                        .pipe(fs.createWriteStream('./app/data/' + name + path + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_NDV.png'))
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

function createFCC(promObj){
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


function compareNDVI(promObj){
    return new Promise((resolve,reject) => {
        var left = parseImageSrc(promObj.leftImage);
        var right = parseImageSrc(promObj.rightImage);
        console.log(left);
        var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/showDifferencesOnImage';
        var formData = {
            NDVI1: fs.createReadStream('./app/data/' + left + 'NDV.png'),
            NDVI2: fs.createReadStream('./app/data/' + right + 'NDV.png'),
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
                request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png', function (err, response, body) {
                })
                    .pipe(fs.createWriteStream('./app/temp/'+ left.substring(0,60)+'_' + right.substring(0,60) +'_CNI.png'))
                    .on('finish', () => {
                        console.log(left + '_' + right + '_CNI.png' + "saved");
                        resolve(promObj);
                    });
            } else {
                reject(err);
            }


        })
    });
}

function parseImageSrc(imageSrc){
    var replacehost = imageSrc.toString().replace(/^[^_]*S2/g,"S2");
    var replaceImageType = replacehost.substring(0,replacehost.length-7);
    return replaceImageType;
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

function createResultFolder(promObj) {
    console.log('creating result');
    return new Promise((resolve, reject) => {
        try {
            fs.mkdirs('./app/data', function(err) {
                if (err) return console.error(err);
            });
            fs.mkdirsSync('./app/data');
            console.log("Ordner ist erstellt");
            resolve(promObj)
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = app;
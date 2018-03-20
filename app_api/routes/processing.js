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
var index = require('./index');
var nodemailer = require('nodemailer');
var schedule = require('node-schedule');




/**
 * Route to upload Shapefiles
 */
app.post('/uploadShapeFile', function (req,res){
    console.log(req.files.filename);
    res.send('uploaded Shapes');
});

/**
 * Image processing route. Calls functions to create folder, unzip the downloaded data,
 * moves the images in root directory, creates PNG's from jp2's, creates NDVI and FCC
 */
app.post('/processImages', function (req,res) {
    console.log(req.body);
    var promObj = {}
    promObj['Shapefile'] = req.body.shapefile;
    promObj['names'] = getImagesNames('./app/data/');

    console.log('NAMES ' + promObj.names);
            createResultFolder(promObj)
            //.then(unZIP('./app/data/','./app/data'))
            //.then(moveImage)
            //.then(GDALTranslate)
            .then(processSentinel)
            .then(resp => {
        console.log("THEN:", resp);
                res.send('Images Ready');
    }).catch((err) => {
        console.log("CATCH:", err)

    })


})

/**
 * Looks for new images calling lookDailyUpdate function
 */
app.get('/lookForNewImages', function (req,res) {
    var promObj = {};
    console.log(req.body.coordinates);
    promObj['coordinates'] = req.query.coordinates;


    lookDailyUpdate(promObj)
        .then((resp) => {
            console.log("THEN:", res);
            res.send(resp);
        }).catch((err) => {
        console.log("CATCH:", err)
        err.send();
    })
})

/**
 * Compares NDVI route
 */
app.get('/compareNDVI', function (req,res) {
    console.log(req.query);
    var promObj = {};

    promObj['leftImage'] = req.query.left;
    promObj['rightImage'] = req.query.right;

    compareNDVI(promObj)
        .then((resp) => {
            console.log("THEN:", res);
            res.send(resp);
        }).catch((err) => {
        console.log("CATCH:", err)
        err.send();
    })
})

/**
 * Automated processing route. Downloads images, unzips them, moves images to root directory,
 * converts JP2 to PNG, calculates NDVI and FCC, Compares the actual image with the last,
 * reads user email and writes an email to the user
 */
app.post('/automatedProcessing', function (req,res) {
    var promObj = {};
    console.log(req.body.id);
    var ID = req.body.id;
    var Name = req.body.name;
    var Shapefile = req.body.shapefile
    promObj['names'] = Name
    promObj['ID'] = ID;
    promObj['Shapefile'] = Shapefile;
    console.log('promObj.Name ' + promObj.names);
    console.log(promObj.Shapefile);
   // promObj.newName = ['S2A_MSIL1C_20180213T041901_N0206_R090_T46QCJ_20180213T075744.SAFE','S2A_MSIL1C_20180213T041901_N0206_R090_T46QCH_20180213T075744.SAFE']



    filterNewImages(promObj)
        //.then(downloadSentinel)
        //.then(unZIP('./app/data/','./app/data'))
       // .then(moveImage)
        //.then(GDALTranslate)
        .then(processSentinelNewImages)
        .then(compareWithLast)
        .then(readMail)
        .then(writeMail)
        .then(resp => {
            console.log("THEN:", resp);
            res.send(resp);
        }).catch((err) => {
        console.log("CATCH:", err)

    })

})

/**
 * Checks if product is in array
 * @param array
 * @param name
 * @returns {boolean}
 */
function checkForItemInArray(array,name){
            regex = new RegExp(name + '.SAFE','g');
            console.log(regex);
            console.log(name);
            console.log(array);
            if(array.some(e => regex.test(e))) {
                return true;
            } else {
                return false;
            }
}

/**
 * Filters the images which are not downloaded yet
 * @param promObj
 * @returns {Promise}
 */
function filterNewImages(promObj) {
    return new Promise((resolve, reject) => {
        var namesArray = [];
        var idArray = [];
        function filter(item, index, callback) {
            var existImage = getImagesNames('./app/data');
            var name = checkForItemInArray(existImage,promObj.names[index]);
            if (name == false) {
                namesArray.push(promObj.names[index]);
                idArray.push(promObj.ID[index]);

            }
            promObj['newName'] = namesArray;
            promObj['newID'] = idArray;
            callback();
        }

        async.eachOfSeries(promObj.names,filter, function (err) {
            if (err) reject(promObj);
            else {
                resolve(promObj);
            }
        });
    })
}


/**
 * Calls bash script to download the new images
 * @param promObj
 * @returns {Promise}
 */
function downloadSentinel(promObj){
    return new Promise((resolve,reject) =>{
        var sys = require('util'),
            exec = require('child_process').exec,
            child;

        var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));

        if(promObj.newID.length >0) {

            var urls = index.parseArrayForBash(promObj.newID);
            var names = index.parseArrayForBash(promObj.newName);


            if (process.platform === "win32") {
                console.log("executing:", directory + '\\downloadProducts.sh ' + urls + ' ' + names);
                child = exec(directory + '\\downloadProducts.sh ' + urls + ' ' + names, [{stdio: 'inherit'}]);

                child.stdout.on('data', (data) => {
                    console.log(`stdout: ${data}`);
                });

                child.stderr.on('data', (data) => {
                    console.log(`stderr: ${data}`);
                });

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

            } else {
                console.log("executing:", './downloadProducts.sh ' + urls + ' ' + names);
                child = exec('bash downloadProducts.sh ' + urls + ' ' + names, [{stdio: 'inherit'}]);

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
        } else {
            reject(promObj);
        }
    })
}

/**
 * Looks for new images from Copernicus API
 * @param promObj
 * @returns {Promise}
 */
function lookDailyUpdate(promObj) {
    return new Promise((resolve,reject) => {
        var url_search = "https://scihub.copernicus.eu/dhus/search?q=";

        auth = {
            'user': 'dwalin93',
            'pass': 'Charly09',
            'sendImmediately': false
        };

        request(url_search + 'footprint:"Intersects(POLYGON((' + promObj.coordinates + ')))" AND platformname:Sentinel-2 AND ingestiondate:[NOW-30DAYS TO NOW] ' + '&rows=100' + '&orderby=beginposition desc&format=json', {auth: auth}, function (error, response, body) {
            console.log(body);
            promObj['results'] = body;
            resolve(promObj);
        })
            .on('finish',function () {
                console.log('finished')
                resolve(promObj);
            })
            .on('error',function() {
                console.log('error')
                reject(promObj);
            })

    })
}

/**
 * Calculates FCC and NDVI parallel
 * @param promObj
 * @returns {Promise}
 */
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

/**
 * Calculates FCC and NDVI for new arrived images
 * @param promObj
 * @param type
 * @returns {Promise}
 */
function processSentinelNewImages(promObj) {
    return new Promise((resolve, reject) =>{
        Promise.all([createFCCNI(promObj), calcNDVINI(promObj)])
            .then(() =>{
                resolve(promObj);
            }).catch((err) =>{
            reject(err);
        })
    })
}

/**
 * Calculates NDVI calling R script through OpenCPU
 * @param promObj
 * @returns {Promise}
 */
function calcNDVI(promObj){
    console.log('I am now in calcNDVI');
    console.log(promObj.names)
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
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png?width=10980&height=10980', function (err, response, body) {
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

/**
 * Create NDVI for new arrived images
 * @param promObj
 * @returns {Promise}
 */
function calcNDVINI(promObj){
    console.log('I am now in calcNDVINI');
    console.log(promObj.newName);
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
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png?width=10980&height=10980', function (err, response, body) {
                    })
                        .pipe(fs.createWriteStream('./app/data/' + name + path + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_NDV.png'))
                        .on('finish', () => {
                            console.log(name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_NDV.png' + "saved");
                            callback();
                        });
                }


            })


        }
        async.eachSeries(promObj.newName, NDVI, function (err) {
            if (err) reject(promObj);
            else {
                resolve(promObj);
            }
        });

    })
}

/**
 * Calculates FCC calling R package through OpenCPU
 * @param promObj
 * @returns {Promise}
 */
function createFCC(promObj){
    return new Promise((resolve,reject) => {
        function FalseColorComposite(name,callback) {
            var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/FCC';
            if (name.toString().substring(8, 10) == '1C') {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png')
                }
            } else {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png')
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
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png?width=10980&height=10980', function (err, response, body) {
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

/**
 * Return FCC image for new arrived images
 * @param promObj
 * @returns {Promise}
 */
function createFCCNI(promObj){
    return new Promise((resolve,reject) => {
        function FalseColorComposite(name,callback) {
            var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/FCC';
            if (name.toString().substring(8, 10) == '1C') {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png')
                }
            } else {
                var formData = {
                    R: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B08.png'),
                    G: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B04.png'),
                    B: fs.createReadStream('./app/data/' + name + '/IMG_DATA/R10m/' + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_B03.png')
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
                    request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/1/png?width=10980&height=10980', function (err, response, body) {
                    })
                        .pipe(fs.createWriteStream('./app/data/' + name + path + name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_FCC.png'))
                        .on('finish', () => {
                            console.log(name.toString().substring(38, 44) + '_' + name.toString().substring(11, 26) + '_FCC.png' + "saved");
                            callback();
                        });
                }


            })


        }
        async.eachSeries(promObj.newName, FalseColorComposite, function (err) {
            if (err) reject(promObj);
            else {
                resolve(promObj);
            }
        });

    })
}

/**
 * Compares two NDVI images calling R package through OpenCPU
 * @param promObj
 * @returns {Promise}
 */
function compareNDVI(promObj){
    return new Promise((resolve,reject) => {
        var left = parseImageSrc(promObj.leftImage);
        var right = parseImageSrc(promObj.rightImage);
        console.log(left);
        var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/showDifferencesOnImage';
        var formData = {
            NDVI1: fs.createReadStream('./app/data/' + left + 'NDV.png'),
            NDVI2: fs.createReadStream('./app/data/' + right + 'NDV.png'),
            TCI1: fs.createReadStream('./app/data/' + left + 'TCI.png'),
            TCI2: fs.createReadStream('./app/data/' + right + 'TCI.png')
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
                left = left.substring(0,60);
                right = right.substring(0,60);
                getCompImages(promObj,left,right,1);
                getCompImages(promObj,left,right,2);
                resolve(promObj);
            } else {
                reject(err);
            }


        })
    });
}

/**
 * Writes E-mail to specified account
 * @param promObj
 * @returns {Promise}
 */
function writeMail(promObj) {
    return new Promise((resolve, reject) => {
        nodemailer.createTestAccount((err, account) => {
            console.log('Sending Mail');
            if (err) {
                console.error('Failed to create a testing account');
                console.error(err);
                reject(promObj);
            }
            let transporter = nodemailer.createTransport({
                host: 'smtp.ethereal.email',
                port: 587,
                auth: {
                    user: 'x6i7imxsjibx3ev6@ethereal.email',
                    pass: 'j6utbr9u2b96gt958v'
                }
            },
                {
                    from: 'Sentinel App <no-reply@SentinelApp.net>',
                }
            );
            // Message object
            let message = {
                // Comma separated list of recipients
                to: promObj.mail,

                // Subject of the message
                subject: 'New Images arrived',
                html: '<p><b>Hello,</b>' +
                '<p>New images arrived for the following tiles:<br>' + promObj.newName + '<br>Please visit the Website to look at the images: <a href="http://gis-bigdata:6502">gis-bigdata:6502</a>'
            }
            transporter.sendMail(message, (err, info) => {
                if (err) {
                    console.log('Error occurred. ' + err.message);
                    return process.exit(1);
                }

                console.log('Message sent: %s', info.messageId);
                // Preview only available when sending through an Ethereal account
                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            });

            resolve(promObj);
        });

    })
}

/**
 * Reads users email
 * @param promObj
 * @returns {Promise}
 */
function readMail(promObj) {
    return new Promise((resolve,reject) =>{
        var readStream = fs.createReadStream('./data' + '/mail.txt', 'utf8');
        let data = ''
        readStream.on('data', function (chunk) {
            data += chunk;
        }).on('end', function () {
            console.log(data);
            promObj['mail'] = data
            resolve(promObj)
        }).on('error',function (err) {
            console.log(err)
            reject(promObj);
        })
    })

}

/**
 * Compares actual image with previous automatically
 * @param promObj
 * @returns {Promise}
 */
function compareWithLast(promObj){
    return new Promise((resolve,reject) => {
        function NDVINowLast(name,callback) {
            var allImageTiles = filterLastImageOfTile(name);
            console.log('allImageTiles: ' + typeof allImageTiles);
            if (allImageTiles.length == 1) {
                resolve(promObj);
            } else {
                var lastImage = sortbyDate(allImageTiles);
                console.log('lastImage: ' + lastImage);
                var now = name;
                console.log('now: ' + now);
                var previous = lastImage[0];
                console.log('previous: ' + previous);
                var url = 'http://gis-bigdata:6501/ocpu/library/SENTINEL2Processing/R/showDifferencesOnImage';
                if (now.toString().substring(8, 10) == '1C') {
                    var formData = {
                        NDVI1: fs.createReadStream('./app/data/' + now + '/IMG_DATA/' + now.toString().substring(38, 44) + '_' + now.toString().substring(11, 26) + '_NDV.png'),
                        NDVI2: fs.createReadStream('./app/data/' + previous + '/IMG_DATA/' + previous.toString().substring(38, 44) + '_' + previous.toString().substring(11, 26) + '_NDV.png'),
                        TCI1: fs.createReadStream('./app/data/' + now + '/IMG_DATA/' + now.toString().substring(38, 44) + '_' + now.toString().substring(11, 26) + '_TCI.png') ,
                        TCI2: fs.createReadStream('./app/data/' + previous + '/IMG_DATA/' + previous.toString().substring(38, 44) + '_' + previous.toString().substring(11, 26) + '_TCI.png')
                    }
                } else {
                    var formData = {
                        NDVI1: fs.createReadStream('./app/data/' + now + '/IMG_DATA/R10m/' + now.toString().substring(38, 44) + '_' + now.toString().substring(11, 26) + '_NDV.png'),
                        NDVI2: fs.createReadStream('./app/data/' + previous + '/IMG_DATA/R10m/' + previous.toString().substring(38, 44) + '_' + previous.toString().substring(11, 26) + '_NDV.png'),
                        TCI1: fs.createReadStream('./app/data/' + now + '/IMG_DATA/R10m/' + now.toString().substring(38, 44) + '_' + now.toString().substring(11, 26) + '_TCI.png') ,
                        TCI2: fs.createReadStream('./app/data/' + previous + '/IMG_DATA/R10m/' + previous.toString().substring(38, 44) + '_' + previous.toString().substring(11, 26) + '_TCI.png')
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
                        getCompImages(promObj,now,previous,1);
                        getCompImages(promObj,now,previous,2);
                        promObj['previous'] = previous;
                        callback();
                    } else {
                        console.log(body)
                        reject(err);
                    }


                })
            }
        }
        async.eachSeries(promObj.newName,NDVINowLast, function (err) {
            if (err) reject(promObj);
            else {
                resolve(promObj);
            }
        });

    });
}

/**
 * Gets the compared images from OCPU
 * @param promObj
 * @param now
 * @param previous
 * @param number
 * @returns {Promise}
 */
function getCompImages(promObj,now,previous,number){
    return new Promise((resolve,reject) => {
        var counter = 1;
        console.log('I AM HERE ' + counter + ' TIMES')
        request.get('http://gis-bigdata:6501/ocpu/tmp/' + promObj.tempLoc + '/graphics/'+ number +'/png', function (err, response, body) {
        })
            .pipe(fs.createWriteStream('./app/temp/' + now + '_' + previous + '_' + number + '_CNI.png'))
            .on('finish', () => {
                console.log(now + '_' + previous + '_'+ number + 'CNI.png' + "saved");
                resolve(promObj)
                counter++;
            })
            .on('error',() =>{
                reject(promObj);
            })
    })
}

/**
 * Sorts array by date
 * @param array
 * @returns {*}
 */
function sortbyDate(array){
    console.log('array to sort: ' + array);
    array.sort(function(a,b){
        a = a.substring(11,19);
        b = b.substring(11,19);
       return  a.localeCompare(b);

})
    return array;
}

/**
 * Filters images from specified tile
 * @param name
 * @returns {*|Array.<T>}
 */
function filterLastImageOfTile(name) {
    var regex = new RegExp(name.substring(38,44));
  //  var images = ['S2A_MSIL1C_20180213T041901_N0206_R090_T46QCH_20180213T075744.SAFE','S2A_MSIL1C_20180213T041901_N0206_R090_T46QCJ_20180213T075744.SAFE','S2B_MSIL1C_20180208T041929_N0206_R090_T46QCJ_20180208T075342.SAFE','S2B_MSIL1C_20180310T041559_N0206_R090_T46QDK_20180310T075716.SAFE']
    var images = getImagesNames('./app/data');
    var filter = images.filter(e => regex.test(e));
    console.log('IMAGES: ' + images);
    console.log('REGEX: ' + regex);
    console.log('FILTER: ' + typeof filter);
    return filter;

}


function parseImageSrc(imageSrc){
    var replacehost = imageSrc.toString().replace(/^[^_]*S2/g,"S2");
    var replaceImageType = replacehost.substring(0,replacehost.length-7);
    return replaceImageType;
}

/**
 * Calls basch script movingImage.sh to move images to root directory
 * @param promObj
 * @returns {Promise}
 */
function moveImage(promObj){
    console.log('I am Moving')
    return new Promise((resolve, reject) => {
            var sys = require('util'),
                exec = require('child_process').exec,
                child;

            var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));
            console.log(directory);

            if (process.platform === "win32") {
                console.log('I am Windows');
                child = exec(directory + '\\movingImage.sh',{stdio:'inherit'});


                    child.on("error", function (error) {
                        console.log("child error:", error);
                        reject(promObj)
                    })

                    child.on('data', function (data) {
                        console.log('hohoho');
                        console.log(data.toString());

                    })

                child.on('exit', function (code, signal) {
                    console.log('child process exited with ' +
                        `code ${code} and signal ${signal}`);
                        resolve(promObj);
                    });




} else {
                child = exec('bash ./movingImage.sh', [{stdio:'inherit'}]);

                child.stderr.pipe(process.stderr);
                child.stdout.pipe(process.stdout);

                child.on("error", function (error) {
                    console.log("child error:", error);
                    reject(promObj)
                })

                child.on('data', function (data) {
                    console.log(data.toString());

                });

                child.on('exit', function (code, signal) {
                    console.log('child process exited with ' +
                        `code ${code} and signal ${signal}`);
                    resolve(promObj);
                });
            }
    });
}


/**
 * Calls bash script GDAL_Translate.sh converting jp2 files to png using GDAL_Translate function
 * @param promObj
 * @returns {Promise}
 * @constructor
 */
function GDALTranslate(promObj) {
    console.log('ITS GDAL NOW');
    return new Promise((resolve, reject) => {
        var sys = require('util'),
            exec = require('child_process').exec,
            child;

        var directory = __dirname.substring(0, __dirname.indexOf("\\app_api"));
        console.log(directory);

        if (process.platform === "win32") {
            child = exec(directory + '\\GDAL_Translate.sh', [{stdio:'inherit'}]);
            console.log('I am Windows')

            child.on("error", function (error) {
                console.log("child error:", error);
                reject(promObj)
            })

            child.on('data', function (data) {
                console.log(data.toString());

            });

            child.on('exit', function (code, signal) {
                console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
                resolve(promObj);
            });


        } else {
            child = exec('bash ./GDAL_Translate.sh', [{stdio:'inherit'}]);

            child.stderr.pipe(process.stderr);
            child.stdout.pipe(process.stdout);

            child.on("error", function (error) {
                console.log("child error:", error);
                reject(promObj)
            })

            child.on('data', function (data) {
                console.log(data.toString());

            });

            child.on('exit', function (code, signal) {
                console.log('child process exited with ' +
                    `code ${code} and signal ${signal}`);
                resolve(promObj);
            });
        }
    })
}


/**
 * unzips folders
 * @param path
 * @param dest
 * @param promObj
 * @returns {Promise}
 */
function unZIP(path,dest,promObj) {
    return new Promise((resolve, reject) => {
        try {
            var files = fs.readdirSync(path);
            console.log(files)
            for (i = 0; i < files.length; i++) {
                console.log(files[i].split('.').pop())
                if (files[i].split('.').pop() == 'zip') {
                    fs.createReadStream(path + files[i]).pipe(unzip.Extract({path: dest}))
                        .on('close', function () {
                            resolve(promObj);
                        })

                }
                else{
                    reject(promObj);
                }

            }
        } catch (error){
            reject(error)
            console.log(error);
        }
    })
}

/**
 * Get all images
 * @param path
 * @returns {*|Array.<T>}
 */
function getImagesNames(path){
    return fs.readdirSync(path).filter(function (file) {
        return fs.statSync(path+'/'+file).isDirectory();
    });
}

/**
 * Create result folder
 * @param promObj
 * @returns {Promise}
 */
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

    function checkExists(image){

    }
}

module.exports = app;
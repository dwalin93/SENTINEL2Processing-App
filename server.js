/**
 * Created by pglah on 23.10.2017.
 */
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var env = require('node-env-file');
var multer = require('multer');
var storage = multer.diskStorage({
    destination: function (req,file,cb) {
        cb(null,'./shapefiles/')
    },
    filename: function (req,file,cb) {
        cb(null,file.originalname)
    }
})
var upload = multer({storage:storage});

var app = express();

// code which is executed on every request
app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url + ' was requested by ' + req.connection.remoteAddress);

    res.setHeader('Access-Control-Allow-Origin', "http://"+req.headers.host, '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE'); //Allow cors
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Authorization');


    next();
});





app.use(express.static(path.join(__dirname, 'app')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(multer({
    storage:storage
}).any());


// our routes will be contained in routes/index.js
var routes = require('./app_api/routes/index');
// Routes if OpenCPU has to do something
var processing = require('./app_api/routes/processing');
app.use('/', routes);
app.use('/processing',processing);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: {}
    });
});


module.exports = app;

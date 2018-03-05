/**
 * Created by pglah on 05.03.2018.
 */
var express = require('express');
var app = express.Router();
var request = require('request');
var async = require('async');

app.get('/test', function (req,res){
    res.send('it works');
});

module.exports = app;
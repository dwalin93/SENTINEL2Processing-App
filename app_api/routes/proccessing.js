/**
 * Created by pglah on 04.02.2018.
 */
var request = require('request');
var fs = require('fs');
var rp = require('request-promise');


function testplumber (promObj){
    return new Promise((resolve, reject) => {
        try {
            var options = {
                url: "http://localhost:8000/test",
                a:'9',
                b:'8',
                json:true
        }
            request.post({
                options
            }, function optionalCallback(err, response, body) {
                err = err || (response && (response.statusCode === 400 ||
                    response.statusCode === 502 ||
                    response.statusCode === 503) && response.statusCode);
                if (!err) {
                    console.log(body);
                    resolve(promObj);
                }
            })
        } catch (err) {
            reject(err);
        }
    })
}

module.exports = {
    testplumber:testplumber
}
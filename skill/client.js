"use strict";

const https = require('https');
const request = require('request');
const crypto = require('crypto');

const url='https://api.twitter.com/1.1/statuses/update.json';

function getEnableTrashes(access_token,access_token_secret) {
    return new Promise((resolve,reject) => {
        const params = {
            access_token: access_token,
            access_token_secret: access_token_secret
        }

        const options = {
            url: "http://localhost:3000/trashes",
            headers: {
                "Content-Type": 'application/json'
            },
            body: JSON.stringify(params)
        };

        request.post(options ,(error,response,body) => {
            if(error) {
                reject("reject:"+error);
            } else if(response.statusCode!=200) {
                reject("reject:statusCode="+response.statusCode);
            } else {
                console.log(body)
                resolve(body);
            }
        });
    });
};

module.exports.getEnableTrashes=getEnableTrashes;

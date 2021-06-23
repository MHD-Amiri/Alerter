var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//// Alerter ////
const ping = require('ping');
const axios = require('axios');
const publicIp = require('public-ip');


let ip = '5.116.165.252';
let hostList = ["8.8.8.8"]

let frequency = 1000; //1 second

/// It can be multiple hosts to check ///
// host2.forEach(function(host){
    setInterval(function() {
        let host = hostList[0]
        let currentPublicIp = publicIp.v4().then(currentPublicIp => {
            // console.log("IP => ", currentPublicIp);
            if (currentPublicIp == ip) {
                console.log("####****** VPN DIACTIVE ******####");
                sendSmsAndEmail();
            }
            else {
                console.log('-------- VPN ACTIVE --------');
            }
        })
        
        ping.sys.probe(host, function(active){
            let info = active ? 'Internet Connection Active' : '|||||||||| INTERNET DISCONNECTED ||||||||||';
            let disconnected = '|||||||||| INTERNET DISCONNECTED ||||||||||';
            if (info === disconnected) {
                console.log(info);
                // sendSmsAndEmail();
            }
        });
    }, frequency);

function sendSmsAndEmail(){
    // console.log("IN FUNCTION");

        let timeout;
        return Promise.race([
            new Promise((resolve, reject) => {
                // console.log("IN PROMISE")
                let receiverNumber = "09373492662";
                // if (receiverNumber.startsWith('0')) {
                //     receiverNumber = '98' + receiverNumber.substr(1, receiverNumber.length - 1);
                // }
                let config = {
                    method: 'post',
                    url: 'https://niksms.com/fa/publicapi/PtpSms',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    params: {
                        username: "989156265530",
                        password: "123456mhd",
                        senderNumber: "50004307",
                        numbers: receiverNumber,
                        message: "*** DISCONNECTED ***"
                    }
                };
                axios(config).then(response => {
                    // console.log("axios then:",response.data, messageContent , receiverNumber );
                    if (response.data.Status === 1) {
                        console.log("SMS SENT");
                        resolve(response.data);
                    } else {
                        reject({
                            msg: "error in sending SMS",
                            error_code: response.data.Status
                        });
                    }

                }).catch(err => {
                    console.log("axios catch")
                    reject(err);
                })
            }).catch(err => {
                console.log("promise catch")
            }),
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => reject({
                    msg: "timeout in receiving response from SMS server"
                }), 10000);
            })

        ]);

}

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

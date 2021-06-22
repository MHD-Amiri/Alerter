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
let axios = require('axios');


let hostList = ['8.8.8.8'];

let frequency = 1000; //1 second

/// It can be multiple hosts to check ///
// host2.forEach(function(host){
    setInterval(function() {
        let host = hostList[0]
        ping.sys.probe(host, function(active){
            let info = active ? 'IP ' + host + ' ---- Active ----' : '|||||||||| DISCONNECTED ||||||||||';
            let connected = 'IP ' + host + ' ---- Active ----';
            if (info === connected) {
                console.log(info);
                // sendSmsAndEmail();
            }
        });
    }, frequency);

function sendSmsAndEmail(){
    // console.log("IN FUNCTION");


    // module.exports.sendSmsAPI = (receiverNumber,messageContent)=>{
        let timeout;
        return Promise.race([
            new Promise((resolve, reject) => {
                // console.log("IN PROMISE")
                let receiverNumber = "09020723812";
                if (receiverNumber.startsWith('0')) {
                    receiverNumber = '98' + receiverNumber.substr(1, receiverNumber.length - 1);
                }
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
                        // console.log("else  1");
                        reject({
                            msg: "error in sending SMS",
                            error_code: response.data.Status
                        });
                    }

                }).catch(err => {
                    console.log("catch")
                    reject(err);
                })
            }),
            new Promise((resolve, reject) => {
                timeout = setTimeout(() => reject({
                    msg: "timeout in receiving response from SMS server"
                }), 10000);
            })

        ]);
    // }

}
// });
////        ////

app.use('/', indexRouter);
app.use('/users', usersRouter);

module.exports = app;

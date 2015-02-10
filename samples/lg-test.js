"use struct";

var LGClient = require('./lg-client').LGClient;
var LG = require('./lg-commands');

var client = new LGClient();
client.connect("192.168.0.25", function () {
    LG.getForegroundAppInfo(client, function (error, d) {
        console.log(error, d);
    });
});
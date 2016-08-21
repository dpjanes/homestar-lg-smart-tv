/*
 *  NOTE: the best way to use this is in "iotdb.js"
 */

"use strict";

const LGClient = require('../lg-client').LGClient;
const LG = require('../lg-commands');

const client = new LGClient();
client.connect("192.168.0.25", function () {
    LG.getForegroundAppInfo(client, function (error, d) {
        console.log(error, d);
    });
});

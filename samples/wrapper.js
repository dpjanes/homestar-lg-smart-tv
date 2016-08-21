/*
 *  NOTE: the best way to use this is in "model.js"
 *  Use a "bridge_wrapper", which handles all injections
 */

"use strict";

const iotdb = require("iotdb");
const _ = iotdb._;

const ModelBinding = require('../models/LGSmartTV');

const wrapper = _.bridge_wrapper(ModelBinding.binding);
wrapper.on('bridge', function (bridge) {
    console.log("+ discovered\n ", _.ld.compact(bridge.meta()));
    bridge.push({
        volume: 19,
        band: "netflix",
    }, function () {});
});
wrapper.on('state', function (bridge, state) {
    console.log("+ state", state);
});
wrapper.on('meta', function (bridge) {
    console.log("+ meta", _.ld.compact(bridge.meta()));
});
wrapper.on('disconnected', function (bridge) {
    console.log("+ disconnected", _.ld.compact(bridge.meta()));
});

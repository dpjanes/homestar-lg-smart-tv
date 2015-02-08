/*
 *  Use a "bridge_wrapper", which handles all injections
 */

var iotdb = require("iotdb");

var LGSmartTV = require('../LGSmartTV');

wrapper = iotdb.bridge_wrapper(LGSmartTV.binding);
wrapper.on('bridge', function(bridge) {
    console.log("+ discovered\n ", bridge.meta());
    bridge.push({
        volume: 19,
        band: "netflix",
    });
})
wrapper.on('state', function(bridge, state) {
    console.log("+ state", state);
})
wrapper.on('meta', function(bridge) {
    console.log("+ meta", bridge.meta());
})
wrapper.on('disconnected', function(bridge) {
    console.log("+ disconnected", bridge.meta());
})

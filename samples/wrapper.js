/*
 *  Use a "bridge_wrapper", which handles all injections
 */

var iotdb = require("iotdb");

var LGSmartTVBridge = require('../LGSmartTVBridge').Bridge;

wrapper = iotdb.bridge_wrapper(new LGSmartTVBridge({
    mdns: true
}));
wrapper.on('discovered', function(bridge) {
    console.log("+ discovered\n ", bridge.meta());
    bridge.push({
        volume: 0.2,
        band: "DVD",
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

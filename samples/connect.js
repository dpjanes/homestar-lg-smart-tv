/*
 *  NOTE: the best way to use this is in "model.js"
 *  Connect to a Denon AVR at a named host
 */

"use strict";

var LGSmartTVBridge = require('../LGSmartTVBridge').Bridge;

var tv = new LGSmartTVBridge();
tv.discovered = function (bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function (state) {
        console.log("+ state-change", state);
    };
    bridge.connect({});
    bridge.push({
        volume: 30,
        // band: "netflix",
        band: "hdmi1",
    }, function() {});
};
tv.discover();

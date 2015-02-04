/*
 *  Connect to a Denon AVR at a named host
 */

var LGSmartTVBridge = require('../LGSmartTVBridge').Bridge;

var denon = new LGSmartTVBridge();
denon.discovered = function(bridge) {
    console.log("+ got one", bridge.meta());
    bridge.pulled = function(state) {
        console.log("+ state-change", state);
    };
    bridge.connect();
    bridge.push({
        volume: 30,
        // band: "netflix",
        band: "hdmi1",
    });
};
denon.discover();

/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var LGSmartTVBridge = require('../LGSmartTVBridge').Bridge;
var LGSmartTVModel = require('../LGSmartTVModel').Model;

wrapper = iotdb.bridge_wrapper(new LGSmartTVBridge({
    mdns: true
}));
wrapper.on('discovered', function(bridge) {
    var model = new LGSmartTVModel();
    model.bind_bridge(bridge);

    model.on_change(function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", model.meta().state());
    });
    model.set('mute', false);
    model.set('volume', 35);
    
    console.log("+ discovered\n ", model.meta().state(), "\n ", model.thing_id());
})

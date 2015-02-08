/*
 *  Use a Model to manipulate semantically
 */

var iotdb = require("iotdb");

var LGSmartTV = require('../LGSmartTV');

wrapper = iotdb.bridge_wrapper(LGSmartTV.binding);
wrapper.on('model', function(model) {
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

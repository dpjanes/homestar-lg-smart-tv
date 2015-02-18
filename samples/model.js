/*
 *  How to use this module stand-alone
 */

try {
    var model = require('homestar-lg-smart-tv')
} catch (x) {
    var model = require('../index')
}

var _ = model.homestar._;

wrapper = model.wrap("LGSmartTV");
wrapper.on('model', function(model) {
    model.on_change(function(model) {
        console.log("+ state\n ", model.state());
    });
    model.on_meta(function(model) {
        console.log("+ meta\n ", _.ld.compact(model.meta().state()));
    });
    model.set('mute', false);
    model.set('volume', 35);
    model.set('band', "hdmi1");
    
    console.log("+ discovered\n ", _.ld.compact(model.meta().state()), "\n ", model.thing_id());
})

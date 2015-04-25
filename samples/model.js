/*
 *  How to use this module stand-alone
 */

"use strict";

try {
    var model = require('homestar-lg-smart-tv');
} catch (x) {
    var model = require('../index');
}

var _ = model.iotdb._;

var wrapper = model.wrap("LGSmartTV");
wrapper.on('thing', function (model) {
    model.on("state", function (model) {
        console.log("+ state\n ", model.thing_id(), model.state("istate"));
    });
    model.on("meta", function (model) {
        console.log("+ state\n ", model.thing_id(), model.state("meta"));
    });
    model.set('mute', false);
    model.set('volume', 35);
    model.set('band', "hdmi1");

    console.log("+ discovered\n ", model.thing_id(), model.state("meta"));
});

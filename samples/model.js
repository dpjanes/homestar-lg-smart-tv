/*
 *  How to use this module stand-alone
 */

"use strict";

const iotdb = require("iotdb")
const _ = iotdb._;

const module = require('homestar-lg-smart-tv');

const wrapper = _.bridge.wrap("LGSmartTV", module.bindings);
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

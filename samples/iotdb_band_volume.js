/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

const iotdb = require('iotdb');
iotdb.use("homestar-lg-smart-tv");

const things = iotdb.connect('LGSmartTV');
things.update("ostate", {
    volume: 35,
    band: "iot-purpose:band.tv",
});

/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 *  Note: to work, this package must have been installed by 'homestar install' 
 */

"use strict";

var iotdb = require('iotdb');
var iot = iotdb.iot();

var things = iot.connect('LGSmartTV');
/*
things.set(":band", "iotdb-attribute:band.tv");
 */
things.update("ostate", {
    volume: 35,
    band: "iot-attribute:band.tv",
});
/*
 */

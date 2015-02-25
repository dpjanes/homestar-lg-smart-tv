/*
 *  How to use this module in IOTDB / HomeStar
 *  This is the best way to do this
 */

var iotdb = require('iotdb')
var iot = iotdb.iot();

var things = iot.connect('LGSmartTV');
things.update({
    volume: 35,
    band: "TV",
});

/*
 *  LGSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-09
 */

var iotdb = require("iotdb");

exports.Model = iotdb.make_model('LGSmartTV')
    .facet(":media.tv")
    .product("http://www.lg.com/us/experience-tvs/smart-tv")
    .name("LG Smart TV (WebOs)")
    .io("band", iotdb.string.band)
    .io("channel", iotdb.integer.channel)
    .io("volume", iotdb.number.percent.volume)
    .io("mute", iotdb.boolean.mute)
    .make();

exports.binding = {
    bridge: require('./LGSmartTVBridge').Bridge,
    model: exports.Model,
};

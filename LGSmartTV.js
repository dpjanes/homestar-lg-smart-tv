/*
 *  LGSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-09
 */

var homestar = require("homestar")

exports.Model = homestar.make_model('LGSmartTV')
    .facet(":media.tv")
    .product("http://www.lg.com/us/experience-tvs/smart-tv")
    .name("LG Smart TV (WebOs)")
    .io("band", homestar.string.band)
    .io("channel", homestar.integer.channel)
    .io("volume", homestar.percent.volume)
    .io("mute", homestar.boolean.mute)
    .make()

exports.binding = {
    bridge: require('./LGSmartTVBridge').Bridge,
    model: exports.Model,
};

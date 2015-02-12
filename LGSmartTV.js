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
    .io("band", "band-value", homestar.string.band)
    .io("channel", "channel-value", homestar.integer.channel)
    .io("volume", "volume-value", homestar.percent.volume)
    .io("mute", "mute-value", homestar.boolean.mute)
    .make()

exports.binding = {
    bridge: require('./LGSmartTVBridge').Bridge,
    model: exports.Model,
};

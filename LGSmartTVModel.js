/*
 *  LGSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-09
 */

var iotdb = require("iotdb")

exports.Model = iotdb.make_model('LGSmartTV')
    .facet(":media.tv")
    .product("http://www.lg.com/us/experience-tvs/smart-tv")
    .name("LG Smart TV (WebOs)")
    .io("band", "band-value", iotdb.string.band)
    .io("channel", "channel-value", iotdb.integer.channel)
    .io("volume", "volume-value", iotdb.percent.volume)
    .io("mute", "mute-value", iotdb.boolean.mute)
    .make()

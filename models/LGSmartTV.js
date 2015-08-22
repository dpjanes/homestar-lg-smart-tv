/*
 *  LGSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-09
 */

var iotdb = require("iotdb");
var _ = iotdb._;

exports.Model = iotdb.make_model('LGSmartTV')
    .facet(":media.tv")
    .product("http://www.lg.com/us/experience-tvs/smart-tv")
    .name("LG Smart TV (WebOs)")
    .io("band",
        iotdb
        .make_string(":band")
        .enumeration(_.ld.expand([
            "iot-purpose:band.tv",
            "iot-purpose:band.hdmi",
            "iot-purpose:band.hdmi#1",
            "iot-purpose:band.hdmi#2",
            "iot-purpose:band.browser",
            "iot-purpose:band.camera",
            "iot-purpose:band.info.guide",
            "iot-purpose:band.info.notifications",
            "iot-purpose:band.service.anyplace-tv",
            "iot-purpose:band.service.cinemanow",
            "iot-purpose:band.service.crackle",
            "iot-purpose:band.service.netflix",
            "iot-purpose:band.service.youtube",
            "iot-purpose:band.service.miracast",
            "iot-purpose:band.service.smartshare",
        ]))
    )
    .io("channel", iotdb.integer.channel)
    .io("volume", iotdb.number.percent.volume)
    .io("mute", iotdb.boolean.mute)
    .make();

exports.binding = {
    bridge: require('../LGSmartTVBridge').Bridge,
    model: exports.Model,
    mapping: {
        band: {
            "iot-purpose:band.service.anyplace-tv": "anyplace.tv",
            "iot-purpose:band.service.cinemanow": "cinemanow",
            "iot-purpose:band.browser": "com.webos.app.browser",
            "iot-purpose:band.camera": "com.webos.app.camera",
            "iot-purpose:band.hdmi": "com.webos.app.hdmi1",
            "iot-purpose:band.hdmi#1": "com.webos.app.hdmi1",
            "iot-purpose:band.hdmi#2": "com.webos.app.hdmi2",
            "iot-purpose:band.tv": "com.webos.app.livetv",
            "iot-purpose:band.service.miracast": "com.webos.app.miracast",
            "iot-purpose:band.info.notifications": "com.webos.app.notificationcenter",
            "iot-purpose:band.service.smartshare": "com.webos.app.smartshare",
            "iot-purpose:band.info.guide": "com.webos.app.tvuserguide",
            "iot-purpose:band.service.crackle": "crackle",
            "iot-purpose:band.service.netflix": "netflix",
            "iot-purpose:band.service.youtube": "youtube.leanback.v4",
        }
    }
};

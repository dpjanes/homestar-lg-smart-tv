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
                "iot-attribute:band.tv",
                "iot-attribute:band.hdmi",
                "iot-attribute:band.hdmi#1",
                "iot-attribute:band.hdmi#2",
                "iot-attribute:band.browser",
                "iot-attribute:band.camera",
                "iot-attribute:band.info.guide",
                "iot-attribute:band.info.notifications",
                "iot-attribute:band.on-demand.anyplace-tv",
                "iot-attribute:band.on-demand.cinemanow",
                "iot-attribute:band.on-demand.crackle",
                "iot-attribute:band.on-demand.netflix",
                "iot-attribute:band.on-demand.youtube",
                "iot-attribute:band.streaming.miracast",
                "iot-attribute:band.streaming.smartshare",
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
            "iot-attribute:band.on-demand.anyplace-tv": "anyplace.tv",
            "iot-attribute:band.on-demand.cinemanow": "cinemanow",
            "iot-attribute:band.browser": "com.webos.app.browser",
            "iot-attribute:band.camera": "com.webos.app.camera",
            "iot-attribute:band.hdmi": "com.webos.app.hdmi1",
            "iot-attribute:band.hdmi#1": "com.webos.app.hdmi1",
            "iot-attribute:band.hdmi#2": "com.webos.app.hdmi2",
            "iot-attribute:band.tv": "com.webos.app.livetv",
            "iot-attribute:band.streaming.miracast": "com.webos.app.miracast",
            "iot-attribute:band.info.notifications": "com.webos.app.notificationcenter",
            "iot-attribute:band.streaming.smartshare": "com.webos.app.smartshare",
            "iot-attribute:band.info.guide": "com.webos.app.tvuserguide",
            "iot-attribute:band.on-demand.crackle": "crackle",
            "iot-attribute:band.on-demand.netflix": "netflix",
            "iot-attribute:band.on-demand.youtube": "youtube.leanback.v4",
        }
    }
};

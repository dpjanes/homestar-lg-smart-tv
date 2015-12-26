/*
 *  LGSmartTV.js
 *
 *  David Janes
 *  IOTDB
 *  2014-12-09
 */

exports.binding = {
    bridge: require('../LGSmartTVBridge').Bridge,
    model: require('./LgSmartTv.json'),
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

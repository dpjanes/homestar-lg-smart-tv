# homestar-lg-smart-tv
[IOTDB](https://github.com/dpjanes/node-iotdb) Bridge for LG SmartTV with IOTDB. 

<img src="https://raw.githubusercontent.com/dpjanes/iotdb-homestar/master/docs/HomeStar.png" align="right" />

# About

Note that we can't turn these _on_ because when the
TV is off it's not on the Internet.

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for use standalone
and <code>iotdb.js</code> for use inside IOTDB.

# Installation

* [Read this first](https://github.com/dpjanes/node-iotdb/blob/master/docs/install.md)

Then:

    $ npm install homestar-lg-smart-tv

# Use

Set the channel to 3

	const iotdb = require('iotdb')
    iotdb.use("homestar-lg-smart-tv")

	const things = iot.connect("LGSmartTV")
	things.set(":channel", 3)

Go to HDMI

	things.set(":band", "iot-purpose:band.hdmi")

# Models
## LGSmartTV

* <code>volume</code>: integer from 0 to 100 (<code>iot-purpose:volume</code>)
* <code>band</code>: string, see below (<code>iot-purpose:band</code>)
* <code>mute</code>: true or false (<code>iot-purpose:mute</code>)
* <code>channel</code>: a string, like <code>3-0</code> (<code>iot-purpose:channel</code>)

### LG TV Bands

These are the LG bands we currently support (the underly strings used
by the TV set), and their corresponding semantic definition (used with 'set').

* anyplace.tv - iot-purpose:band.service.anyplace-tv
* cinemanow - iot-purpose:band.service.cinemanow
* com.webos.app.browser - iot-purpose:band.browser
* com.webos.app.camera - iot-purpose:band.camera
* com.webos.app.hdmi1 - iot-purpose:band.hdmi
* com.webos.app.hdmi1 - iot-purpose:band.hdmi.1
* com.webos.app.hdmi2 - iot-purpose:band.hdmi.2
* com.webos.app.livetv - iot-purpose:band.tv
* com.webos.app.miracast - iot-purpose:band.service.miracast
* com.webos.app.notificationcenter - iot-purpose:band.info.notifications
* com.webos.app.smartshare - iot-purpose:band.service.smartshare
* com.webos.app.tvuserguide - iot-purpose:band.info.guide
* crackle - iot-purpose:band.service.crackle
* netflix - iot-purpose:band.service.netflix
* youtube.leanback.v4 - iot-purpose:band.service.youtube

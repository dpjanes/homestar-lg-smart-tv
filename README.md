# homestar-lg-smart-tv

Connect and control LG SmartTV with HomeStar and IOTDB. 

<img src="https://github.com/dpjanes/iotdb-homestar/blob/master/docs/HomeStar.png" align="right" />

Note that we can't turn these _on_ because when the
TV is off it's not on the Internet.

See <a href="samples/">the samples</a> for details how to add to your project,
particularly <code>model.js</code> for use standalone
and <code>iotdb.js</code> for use inside IOTDB.

# Installation

Install Home☆Star first. 
See: https://github.com/dpjanes/iotdb-homestar#installation

Then

    $ homestar install homestar-lg-smart-tv

# Quick Start

Set the channel to 3

	$ npm install -g homestar ## with 'sudo' if error
	$ homestar setup
	$ homestar install homestar-lg-smart-tv
	$ node
	>>> iotdb = require('iotdb')
	>>> iot = iotdb.iot()
	>>> things = iot.connect("LGSmartTV")
	>>> things.set(":channel", 3)

# LGSmartTV

* <code>volume</code>: integer from 0 to 100 (<code>iot-attribute:volume</code>)
* <code>band</code>: string, see below (<code>iot-attribute:band</code>)
* <code>mute</code>: true or false (<code>iot-attribute:mute</code>)
* <code>channel</code>: a string, like <code>3-0</code> (<code>iot-attribute:channel</code>)

### LG TV Bands

Not a complete list. This needs to be made semantic

* anyplace.tv
* cinemanow
* com.webos.app.browser
* com.webos.app.camera
* com.webos.app.capturetv
* com.webos.app.connectionwizard
* com.webos.app.discovery
* com.webos.app.hdmi1
* com.webos.app.hdmi2
* com.webos.app.livetv
* com.webos.app.miracast
* com.webos.app.notificationcenter
* com.webos.app.smartshare
* com.webos.app.tvuserguide
* crackle
* netflix
* tkc
* youtube.leanback.v4

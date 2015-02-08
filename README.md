# homestar-lg-smart-tv

Connect and control LG SmartTV with HomeStar and IOTDB. 
Note that we can't turn these on and off.

See <a href="samples/">the samples</a> for details how to add to your project.

## LGSmartTVModel

Semantic.

### Attributes

* <code>iot-attribute:volume</code>
* <code>iot-attribute:band</code>
* <code>iot-attribute:mute</code>
* <code>iot-attribute:channel</code>

## LGSmartTVBridge

Low-level.

#### Push / controls

* <code>volume</code>: integer from 0 to 100
* <code>band</code>: string, see below
* <code>mute</code>: true or false
* <code>channel</code>: a string, like 3-0

#### Pull / readings

* <code>volume-value</code>: integer from 0 to 100
* <code>band-value</code>: string, see below
* <code>mute-value</code>: true or false
* <code>channel-value</code>: a string, like 3-0

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

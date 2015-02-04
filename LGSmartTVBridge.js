/*
 *  LGSmartTVBridge.js
 *
 *  David Janes
 *  IOTDB.org
 *  2015-02-04
 *
 *  Copyright [2013-2015] [David P. Janes]
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

"use struct";

var iotdb = require('iotdb')
var _ = iotdb.helpers;

var LGClient = require('./lg-client').LGClient;
var LG = require('./lg-commands');

var bunyan = require('bunyan');
var logger = bunyan.createLogger({
    name: 'homestar-lg-smart-tv',
    module: 'LGSmartTVBridge',
});

/*
      "uuid": "c2dae0fb-113a-a62b-6819-076e04a2e6fd",
      "udn": "uuid:c2dae0fb-113a-a62b-6819-076e04a2e6fd",
      "forgotten": false,
      "last_seen": 1423088999360,
      "location": "http://192.168.0.25:1285/",
      "deviceType": "urn:schemas-upnp-org:device:Basic:1",
      "friendlyName": "LG Smart+ TV",
      "manufacturer": "LG Electronics",
      "manufacturerUrl": "http://www.lge.com",
      "modelNumber": "55LB6300-UQ",
      "modelDescription": "",
      "modelName": "LG Smart TV",
      "modelUrl": "http://www.lge.com",
      "softwareVersion": null,
      "hardwareVersion": null,
 */


/**
 *  EXEMPLAR and INSTANCE
 *  <p>
 *  No subclassing needed! The following functions are 
 *  injected _after_ this is created, and before .discover and .connect
 *  <ul>
 *  <li><code>discovered</code> - tell IOTDB that we're talking to a new Thing
 *  <li><code>pulled</code> - got new data
 *  <li><code>connected</code> - this is connected to a Thing
 *  <li><code>disconnnected</code> - this has been disconnected from a Thing
 *  </ul>
 */
var LGSmartTVBridge = function(paramd, native) {
    var self = this;

    self.paramd = _.defaults(paramd, {
        number: 0,
        poll: 30,
        upnpn: true,
    });
    self.native = native;
    self.stated = {};
};

/* --- lifecycle --- */

/**
 *  EXEMPLAR. 
 *  Discover Hue
 *  <ul>
 *  <li>look for Things (using <code>self.bridge</code> data to initialize)
 *  <li>find / create a <code>native</code> that does the talking
 *  <li>create an LGSmartTVBridge(native)
 *  <li>call <code>self.discovered(bridge)</code> with it
 */
LGSmartTVBridge.prototype.discover = function() {
    var self = this;

    var cp = iotdb.upnp.control_point();

    cp.on("device", function (native) {
        if (native.deviceType !== 'urn:schemas-upnp-org:device:Basic:1') {
            return;
        } else if (native.modelName !== "LG Smart TV") {
            return;
        }

        logger.info({
            method: "discover",
        }, "found LGSmartTV");

        self.discovered(new LGSmartTVBridge(self.paramd, native));
    });

    cp.search();
};

/**
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
LGSmartTVBridge.prototype.connect = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    self._setup_polling();
    self.pull();
};

LGSmartTVBridge.prototype._setup_polling = function() {
    var self = this;
    if (!self.paramd.poll) {
        return;
    }

    var timer = setInterval(function() {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.paramd.poll * 1000);
};

LGSmartTVBridge.prototype._forget = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
}

/**
 *  INSTANCE and EXEMPLAR (during shutdown). 
 *  This is called when the Bridge is no longer needed. 
 */
LGSmartTVBridge.prototype.disconnect = function() {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  INSTANCE.
 *  Send data to whatever you're taking to.
 */
LGSmartTVBridge.prototype.push = function(pushd) {
    var self = this;
    if (!self.native) {
        return;
    }

    var client = new LGClient();
    client.connect(self.native.host, function (error) {
        if (error) {
            logger.info({
                method: "push/connect(error)",
                unique_id: self.unique_id,
                error: error,
            }, "called");
            return;
        }

        if (pushd.band !== undefined) {
            // XXX - THIS NEEDS TO BE SEMANTIC
            var launch = pushd.band.toLowerCase();
            if (launch === "hdmi1") {
                launch = "com.webos.app.hdmi1";
            } else if (launch === "hdmi2") {
                launch = "com.webos.app.hdmi2";
            } else if (launch === "hdmi3") {
                launch = "com.webos.app.hdmi3";
            } else if (launch === "tv") {
                launch = "com.webos.app.livetv";
            } else if (launch === "netflix") {
                launch = "netflix";
            } else {
                launch = pushd.band;
            }

            LG.launch(client, launch, function (error, d) {
                logger.info({
                    method: "push/connect/band",
                    unique_id: self.unique_id,
                    launch: launch,
                    band: pushd.band,
                }, "called");
            });
        }

        if (pushd.channel !== undefined) {
            LG.setChannel(client, pushd.channel, function (error, d) {
                logger.info({
                    method: "push/connect/setChannel",
                    unique_id: self.unique_id,
                    channel: pushd.channel,
                }, "called");
            });
        }

        if (pushd.volume !== undefined) {
            LG.setVolume(client, pushd.volume, function (error, d) {
                logger.info({
                    method: "push/connect/setVolume",
                    unique_id: self.unique_id,
                    volume: pushd.volume,
                }, "called");
            });
        }

        if (pushd.mute !== undefined) {
            LG.setMute(client, pushd.mute, function (error, d) {
                logger.info({
                    method: "push/connect/setMute",
                    unique_id: self.unique_id,
                    mute: pushd.mute,
                }, "called");
            });
        }
    });
};

/**
 *  INSTANCE.
 *  Pull data from whatever we're talking to. You don't
 *  have to implement this if it doesn't make sense
 */
LGSmartTVBridge.prototype.pull = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    /*
    logger.info({
        method: "pull",
        unique_id: self.unique_id
    }, "called");

    var qitem = {
        id: self.paramd.number + OFFSET_PULL,
        run: function () {
            var url = self.url;
            logger.info({
                method: "pull",
                url: url
            }, "do");
            unirest
                .get(url)
                .headers({
                    'Accept': 'application/json'
                })
                .end(function (result) {
                    self.queue.finished(qitem);
                    if (!result.ok) {
                        logger.error({
                            method: "pull",
                            url: url,
                            result: result
                        }, "not ok");
                        return;
                    }

                    if (result.body && result.body.state) {
                        var changed = false;
                        var state = result.body.state;
                        if (state.on !== undefined) {
                            var value_on = state.on ? true : false;
                            if (value_on !== self.stated['on-value']) {
                                self.stated['on-value'] = value_on;
                                changed = true;
                            }
                        }
                        if ((state.xy !== undefined) && (state.bri !== undefined)) {
                            value_hex = _h2c(state);
                            if (value_hex !== self.stated['color-value']) {
                                self.stated['color-value'] = value_hex;
                                changed = true;
                            }
                        }

                        if (changed) {
                            self.pulled(self.stated);

                            logger.info({
                                method: "pull",
                                light: self.paramd.number,
                                pulld: self.stated,
                            }, "pulled");
                        }
                    }
                });
        }
    };
    self.queue.add(qitem);
    */
    return self;
};

/* --- state --- */

/**
 *  INSTANCE.
 *  Return the metadata - compact form can be used.
 *  Does not have to work when not reachable
 *  <p>
 *  Really really useful things are:
 *  <ul>
 *  <li><code>iot:thing</code> required - a unique ID
 *  <li><code>iot:device</code> suggested if linking multiple things together
 *  <li><code>iot:name</code>
 *  <li><code>iot:number</code>
 *  <li><code>schema:manufacturer</code>
 *  <li><code>schema:model</code>
 */
LGSmartTVBridge.prototype.meta = function() {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing": _.id.thing_urn.unique("LGSmartTV", self.native.uuid),
        "iot:name": self.native.friendLy || "LGSmartTV",
        "schema:manufacturer": self.native.manufacturerUrl,
        "schema:mpn": self.native.modelNumber,
    };
};

/**
 *  INSTANCE.
 *  Return True if this is reachable. You 
 *  do not need to worry about connect / disconnect /
 *  shutdown states, they will be always checked first.
 */
LGSmartTVBridge.prototype.reachable = function() {
    return this.native !== null;
};

/**
 *  INSTANCE.
 *  Return True if this is configured. Things
 *  that are not configured are always not reachable.
 *  If not defined, "true" is returned
 */
LGSmartTVBridge.prototype.configured = function() {
    return true;
};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
LGSmartTVBridge.prototype.discovered = function(bridge) {
    throw new Error("LGSmartTVBridge.discovered not implemented");
};

LGSmartTVBridge.prototype.pulled = function(pulld) {
    throw new Error("LGSmartTVBridge.pulled not implemented");
};

/*
 *  API
 */
exports.Bridge = LGSmartTVBridge;


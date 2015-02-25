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

"use strict";

var iotdb = require('iotdb')
var _ = iotdb._;
var bunyan = iotdb.bunyan;

var LGClient = require('./lg-client').LGClient;
var LG = require('./lg-commands');

var logger = bunyan.createLogger({
    name: 'homestar-lg-smart-tv',
    module: 'LGSmartTVBridge',
});

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
var LGSmartTVBridge = function(initd, native) {
    var self = this;

    self.initd = _.defaults(initd, {
        number: 0,
        poll: 30,
        retry: 15,
        upnpn: true,
    });
    self.native = native;
    self.stated = {};

    if (self.native) {
        self.queued = [];
        self.client = null;
    }
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

    var cp = iotdb.upnp().control_point();

    cp.on("device", function (native) {
        if (native.deviceType !== 'urn:schemas-upnp-org:device:Basic:1') {
            return;
        } else if (native.modelName !== "LG Smart TV") {
            return;
        }

        logger.info({
            method: "discover",
        }, "found LGSmartTV");

        self.discovered(new LGSmartTVBridge(self.initd, native));
    });

    cp.search();
};

/**
 *  INSTANCE
 *  This is called when the Bridge is no longer needed. When
 */
LGSmartTVBridge.prototype.connect = function(connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._setup_polling();
    self.pull();
};

LGSmartTVBridge.prototype._setup_polling = function() {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function() {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
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

    if (pushd.band !== undefined) {
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

        self._queue("set-band", function(client) {
            LG.launch(client, launch, function (error, d) {
                logger.info({
                    method: "push/connect/band",
                    unique_id: self.unique_id,
                    launch: launch,
                    band: pushd.band,
                    // d: d,
                }, "called");

                if (!error && (self.stated.band !== pushd.band)) {;
                    self.stated.band = pushd.band;
                    self.pulled(self.stated);
                }
            });
        });
    }

    if (pushd.channel !== undefined) {
        self._queue("set-channel", function(client) {
            LG.setChannel(client, pushd.channel, function (error, d) {
                logger.info({
                    method: "push/connect/setChannel",
                    unique_id: self.unique_id,
                    channel: pushd.channel,
                    // d: d,
                }, "called");

                if (!error && (self.stated.channel !== pushd.channel)) {;
                    self.stated.channel = pushd.channel;
                    self.pulled(self.stated);
                }
            });
        });
    }

    if (pushd.volume !== undefined) {
        self._queue("set-volume", function(client) {
            LG.setVolume(client, pushd.volume, function (error, d) {
                logger.info({
                    method: "push/connect/setVolume",
                    unique_id: self.unique_id,
                    volume: pushd.volume,
                    // d: d,
                }, "called");

                if (!error && (self.stated.volume !== pushd.volume)) {;
                    self.stated.volume = pushd.volume;
                    self.pulled(self.stated);
                }
            });
        });
    }

    if (pushd.mute !== undefined) {
        self._queue("set-mute", function(client) {
            LG.setMute(client, pushd.mute, function (error, d) {
                logger.info({
                    method: "push/connect/setMute",
                    unique_id: self.unique_id,
                    mute: pushd.mute,
                    // d: d,
                }, "called");

                if (!error && (self.stated.mute !== pushd.mute)) {;
                    self.stated.mute = pushd.mute;
                    self.pulled(self.stated);
                }
            });
        });
    }
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

    self._queue("get-channel", function(client) {
        LG.getChannel(client, function (error, d) {
            logger.debug({
                method: "push/connect/getChannel",
                unique_id: self.unique_id,
                d: d
            }, "result");

            if (d.returnValue !== true) {
                return;
            }

            if (d.channelNumber !== self.stated['channel']) {
                self.stated['channel'] = d.channelNumber;
                self.pulled(self.stated);
            }
        });
    });

    self._queue("get-mute", function(client) {
        LG.getMute(client, function (error, d) {
            logger.debug({
                method: "push/connect/getMute",
                unique_id: self.unique_id,
                d: d
            }, "result");

            if (d.returnValue !== true) {
                return;
            }

            if (d.mute !== self.stated['mute']) {
                self.stated['mute'] = d.mute;
                self.pulled(self.stated);
            }
        });
    });

    self._queue("get-volume", function(client) {
        LG.getVolume(client, function (error, d) {
            logger.debug({
                method: "push/connect/getVolume",
                unique_id: self.unique_id,
                d: d
            }, "result");

            if (d.returnValue !== true) {
                return;
            }

            if (d.volume !== self.stated['volume']) {
                self.stated['volume'] = d.volume;
                self.pulled(self.stated);
            }
        });
    });

    self._queue("get-band", function(client) {
        LG.getForegroundAppInfo(client, function (error, d) {
            logger.debug({
                method: "push/connect/getForegroundAppInfo",
                unique_id: self.unique_id,
                d: d
            }, "result");

            if (d.returnValue !== true) {
                return;
            }

            if (d.appId !== self.stated['band']) {
                self.stated['band'] = d.appId;
                self.pulled(self.stated);
            }
        });
    });

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
 *  Configure an express web page to configure this Bridge.
 *  Return the name of the Bridge, which may be 
 *  listed and displayed to the user.
 *
 *  XXX - this may actually need configuring
 */
LGSmartTVBridge.prototype.configure = function(app) {
};

/* --- injected: THIS CODE WILL BE REMOVED AT RUNTIME, DO NOT MODIFY  --- */
LGSmartTVBridge.prototype.discovered = function(bridge) {
    throw new Error("LGSmartTVBridge.discovered not implemented");
};

LGSmartTVBridge.prototype.pulled = function(pulld) {
    throw new Error("LGSmartTVBridge.pulled not implemented");
};

/* -- internals -- */
LGSmartTVBridge.prototype._queue = function(qid, f) {
    var self = this;

    self.queued[qid] = f;
    self._run();
};

LGSmartTVBridge.prototype._run = function() {
    var self = this;

    // anything queued?
    var f = null;
    for (var qid in self.queued) {
        f = self.queued[qid];
        if (f) {
            break;
        }
    }

    if (!f) {
        return;
    }

    // connect if not, otherwise run
    if (!self.client) {
        var _on_close = function() {
            if (!self.client) {
                return;
            }

            self.client.removeAllListeners();
            self.client = null;
        };

        self.client = new LGClient();
        self.client.on('error', _on_close);
        self.client.on('close', _on_close);
        self.client.connect(self.native.host, function () {
            return self._run();
        });
    } else if (!self.client.ready) {
        return;
    } else {
        delete self.queued[qid];

        f(self.client);
        self._run();
    }
};


/*
 *  API
 */
exports.Bridge = LGSmartTVBridge;

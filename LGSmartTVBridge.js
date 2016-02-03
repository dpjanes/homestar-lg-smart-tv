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

var iotdb = require('iotdb');
var _ = iotdb._;

var LGClient = require('./lg-client').LGClient;
var LG = require('./lg-commands');

var logger = iotdb.logger({
    name: 'homestar-lg-smart-tv',
    module: 'LGSmartTVBridge',
});

/**
 *  See {iotdb.bridge.Bridge#Bridge} for documentation.
 *  <p>
 *  @param {object|undefined} native
 *  only used for instances, should be 
 */
var LGSmartTVBridge = function (initd, native) {
    var self = this;

    self.initd = _.defaults(initd,
        iotdb.keystore().get("bridges/LGSmartTVBridge/initd"), {
            number: 0,
            poll: 30,
            retry: 15,
            upnpn: true,
        }
    );
    self.native = native;
    self.stated = {};

    if (self.native) {
        self.queued = [];
        self.client = null;
    }
};

LGSmartTVBridge.prototype = new iotdb.Bridge();

LGSmartTVBridge.prototype.name = function () {
    return "LGSmartTVBridge";
};

/* --- lifecycle --- */

/**
 *  See {iotdb.bridge.Bridge#discover} for documentation.
 */
LGSmartTVBridge.prototype.discover = function () {
    var self = this;

    var cp = require("iotdb-upnp").control_point();

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
 *  See {iotdb.bridge.Bridge#connect} for documentation.
 */
LGSmartTVBridge.prototype.connect = function (connectd) {
    var self = this;
    if (!self.native) {
        return;
    }

    self._validate_connect(connectd);

    self._setup_polling();
    self.pull();
};

LGSmartTVBridge.prototype._setup_polling = function () {
    var self = this;
    if (!self.initd.poll) {
        return;
    }

    var timer = setInterval(function () {
        if (!self.native) {
            clearInterval(timer);
            return;
        }

        self.pull();
    }, self.initd.poll * 1000);
};

LGSmartTVBridge.prototype._forget = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    logger.info({
        method: "_forget"
    }, "called");

    self.native = null;
    self.pulled();
};

/**
 *  See {iotdb.bridge.Bridge#disconnect} for documentation.
 */
LGSmartTVBridge.prototype.disconnect = function () {
    var self = this;
    if (!self.native || !self.native) {
        return;
    }

    self._forget();
};

/* --- data --- */

/**
 *  See {iotdb.bridge.Bridge#push} for documentation.
 */
LGSmartTVBridge.prototype.push = function (pushd, done) {
    var self = this;
    if (!self.native) {
        done(new Error("not connected"));
        return;
    }

    self._validate_push(pushd);

    var dcount = 0;
    var _doing = function () {
        dcount++;
    };
    var _done = function () {
        if (--dcount <= 0) {
            done();
        }
    };

    try {
        _doing();

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

            _doing();

            self._queue("set-band", function (client) {
                LG.launch(client, launch, function (error, d) {
                    logger.info({
                        method: "push/connect/band",
                        unique_id: self.unique_id,
                        launch: launch,
                        band: pushd.band,
                        // d: d,
                    }, "called");

                    if (!error && (self.stated.band !== pushd.band)) {
                        self.stated.band = pushd.band;
                        self.pulled(self.stated);
                    }

                    _done();
                });
            });
        }

        if (pushd.channel !== undefined) {
            _doing();

            self._queue("set-channel", function (client) {
                LG.setChannel(client, pushd.channel, function (error, d) {
                    logger.info({
                        method: "push/connect/setChannel",
                        unique_id: self.unique_id,
                        channel: pushd.channel,
                        // d: d,
                    }, "called");

                    if (!error && (self.stated.channel !== pushd.channel)) {
                        self.stated.channel = pushd.channel;
                        self.pulled(self.stated);
                    }

                    _done();
                });
            });
        }

        if (pushd.volume !== undefined) {
            _doing();

            self._queue("set-volume", function (client) {
                LG.setVolume(client, Math.floor(pushd.volume), function (error, d) {
                    logger.info({
                        method: "push/connect/setVolume",
                        unique_id: self.unique_id,
                        volume: pushd.volume,
                        // d: d,
                    }, "called");

                    if (!error && (self.stated.volume !== pushd.volume)) {
                        self.stated.volume = Math.floor(pushd.volume);
                        self.pulled(self.stated);
                    }

                    _done();
                });
            });
        }

        if (pushd.mute !== undefined) {
            _doing();

            self._queue("set-mute", function (client) {
                LG.setMute(client, pushd.mute, function (error, d) {
                    logger.info({
                        method: "push/connect/setMute",
                        unique_id: self.unique_id,
                        mute: pushd.mute,
                        // d: d,
                    }, "called");

                    if (!error && (self.stated.mute !== pushd.mute)) {
                        self.stated.mute = pushd.mute;
                        self.pulled(self.stated);
                    }

                    _done();
                });
            });
        }

        _done();
    } catch (x) {
        dcount = -9999;
        done(new Error("unexpected excption: " + x));
    }
};

/**
 *  See {iotdb.bridge.Bridge#pull} for documentation.
 */
LGSmartTVBridge.prototype.pull = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    self._queue("get-channel", function (client) {
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

    self._queue("get-mute", function (client) {
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

    self._queue("get-volume", function (client) {
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

    self._queue("get-band", function (client) {
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
 *  See {iotdb.bridge.Bridge#meta} for documentation.
 */
LGSmartTVBridge.prototype.meta = function () {
    var self = this;
    if (!self.native) {
        return;
    }

    return {
        "iot:thing-id": _.id.thing_urn.unique("LGSmartTV", self.native.uuid),
        "schema:name": self.native.friendLy || "LGSmartTV",
        "schema:manufacturer": self.native.manufacturerUrl,
        "schema:mpn": self.native.modelNumber,
    };
};

/**
 *  See {iotdb.bridge.Bridge#reachable} for documentation.
 */
LGSmartTVBridge.prototype.reachable = function () {
    return this.native !== null;
};

/**
 *  See {iotdb.bridge.Bridge#configure} for documentation.
 *  <p>
 *  XXX - this may actually need configuring
 */
LGSmartTVBridge.prototype.configure = function (app) {};

/* -- internals -- */
LGSmartTVBridge.prototype._queue = function (qid, f) {
    var self = this;

    self.queued[qid] = f;
    self._run();
};

LGSmartTVBridge.prototype._run = function () {
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
        var _on_close = function () {
            if (!self.client) {
                return;
            }

            self.client.removeAllListeners();
            self.client = null;
        };

        self.client = new LGClient({
            client_key: self.initd.client_key,
        });
        self.client.on('error', _on_close);
        self.client.on('close', _on_close);
        self.client.on('registered', function (client_key) {
            if (client_key !== self.initd.client_key) {
                iotdb.keystore().save("bridges/LGSmartTVBridge/initd/client_key", client_key, {
                    mkdirs: true,
                });
            }
        });
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

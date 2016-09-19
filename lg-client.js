/*
 * Copyright (c) 2014 LG Electronics.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const iotdb = require('iotdb');

const events = require('events');
const WebSocket = require('ws');
const util = require('util');

const logger = iotdb.logger({
    name: 'homestar-lg-smart-tv',
    module: 'lg-client',
});

const LGClient = function (initd) {
    events.EventEmitter.call(this);

    this.client_key = null;
    if (initd && initd.client_key) {
        this.client_key = initd.client_key;
    }

    this.ready = false;
    this.requestId = 1;
    this.requests = {};
    this.manifest = {
        permissions: [
            "APP_TO_APP",
            "CONTROL_AUDIO",
            "CONTROL_DISPLAY",
            "CONTROL_INPUT_JOYSTICK",
            "CONTROL_INPUT_MEDIA_PLAYBACK",
            "CONTROL_INPUT_MEDIA_RECORDING",
            "CONTROL_INPUT_TEXT",
            "CONTROL_INPUT_TV",
            "CONTROL_MOUSE_AND_KEYBOARD",
            "CONTROL_POWER",
            "LAUNCH",
            "LAUNCH_WEBAPP",
            "READ_CURRENT_CHANNEL",
            "READ_INPUT_DEVICE_LIST",
            "READ_INSTALLED_APPS",
            "READ_NETWORK_STATE",
            "READ_RUNNING_APPS",
            "READ_TV_CHANNEL_LIST",
            "WRITE_NOTIFICATION_TOAST",
        ]
    };
};

events.EventEmitter.call(LGClient);
util.inherits(LGClient, events.EventEmitter);

LGClient.prototype.connect = function (ip, cb) {
    if (cb) {
        var handler = function () {
            this.removeListener('connected', handler);
            this.removeListener('error', handler);
            this.removeListener('close', handler);
        };

        this.on('connected', handler);
        this.on('error', handler);
        this.on('close', handler);
    }

    this.ws = new WebSocket("ws://" + ip + ":3000", {
        origin: "null"
    });

    this.ws.on('open', function () {
        logger.info({
            method: "connect/on(open)",
        }, "called");

        this.send({
            type: 'register',
            payload: {
                manifest: this.manifest,
                "client-key": this.client_key,
                // "client-key": "5e8c8ea4f9ccc45f996ba8cf05cd9cb4"
            }
        });
    }.bind(this));

    this.ws.on('message', function (data) {
        logger.info({
            method: "connect/on(message)",
            data: data
        }, "called");

        var message = JSON.parse(data);

        var request = message.id ? this.requests[message.id] : null;

        if (message.type === "response" || message.type === "error") {
            if (request) {
                if (request.callback) {
                    request.callback(message.error, message.payload);
                }

                if (!request.isSubscription) {
                    delete this.requests[request];
                }
            }
        } else if (message.type === "registered") {
            this.emit('registered', message.payload['client-key']);
            this.emit('connected');
            this.ready = true;

            if (cb !== undefined) {
                cb();
                cb = undefined;
            }
        }
    }.bind(this));

    this.ws.on('error', function (err) {
        this.ready = false;
        this.emit('error', err);
    }.bind(this));

    this.ws.on('close', function () {
        this.ready = false;
        this.emit('close', 'connection closed');
    }.bind(this));
};

LGClient.prototype.send = function (obj) {
    logger.info({
        method: "send",
        object: obj
    }, "called");

    this.ws.send(JSON.stringify(obj));
};

LGClient.prototype.sendRequest = function (uri, payload, cb) {
    var requestId = this.requestId++;

    this.send({
        type: 'request',
        id: requestId,
        uri: uri,
        payload: payload || {}
    });

    this.requests[requestId] = {
        callback: cb
    };
};

exports.LGClient = LGClient;

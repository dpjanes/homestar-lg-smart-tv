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

var homestar = require('homestar');
var bunyan = homestar.bunyan;

var events = require('events');
var WebSocket = require('ws');
var util = require('util');

var logger = bunyan.createLogger({
    name: 'homestar-lg-smart-tv',
    module: 'lg-finder',
});

function LGFinder() {
    events.EventEmitter.call(this);
    this.devices = {};
    this.startDiscovery();
};

util.inherits(LGFinder, events.EventEmitter);

LGFinder.prototype.getDeviceList = function () {
    return this.devices;
};

LGFinder.prototype.startDiscovery = function () {
    if (this.socket) {
        return;
    }

    var dgram = require('dgram');
    var socket = this.socket = dgram.createSocket('udp4');
    var sendSocket = dgram.createSocket('udp4');

    var sendSearch = this.sendSearch.bind(this);
    var cleanOld = function () {
        Object.keys(this.devices).forEach(function (ip) {
            var record = this.devices[ip];

            if (record && --record.ttl <= 0) {
                delete this.devices[ip];
                this.emit("lost", reocrd.address);
            }
        }, this);
    }.bind(this);

    socket.on('listening', function () {
        socket.setBroadcast(true);
        socket.addMembership('239.255.255.250');

        for (var i = 0; i < 3; i++) {
            setTimeout(function () {
                sendSearch();
            }, Math.random() * 1000);
        }

        this.rescanId = setInterval(function () {
            cleanOld();
            sendSearch();
        }, 10 * 1000);
    });

    socket.on('message', function (data, rinfo) {
        if (/^HTTP\/1.1 200 OK\r\n/.test(data) || /^NOTIFY \* HTTP\/1.1\r\n/.test(data)) {
            logger.info({
                method: "startDiscovery/on(message)",
                data: "" + data,
                rinfo: rinfo
            }, "got response");

            if (/USN:.*service:webos-second-screen/.test(data)) {
                if (/ssdp:byebye/.test(data)) {
                    delete this.devices[rinfo.address];
                    this.emit("lost", rinfo.address);
                } else {
                    var existing = this.devices[rinfo.address];
                    this.devices[rinfo.address] = {
                        ttl: 2
                    };

                    if (!existing) {
                        this.emit("found", rinfo.address);
                    }
                }
                this.emit("update");
            }
        }
    }.bind(this));

    socket.bind(0, '0.0.0.0');
};

LGFinder.prototype.sendSearch = function () {
    var data = "M-SEARCH * HTTP/1.1\r\n" +
        "Host: 239.255.255.250:1900\r\n" +
        "ST: urn:lge-com:service:webos-second-screen:1\r\n" +
        "MAN: \"ssdp:discover\"\r\n" +
        "MX: 5\r\n" +
        "\r\n";

    logger.info({
        method: "sendSearch",
        data: data
    }, "called");

    var buffer = new Buffer(data, 'ascii');
    this.socket.send(buffer, 0, buffer.length, 1900, "239.255.255.250");
};

LGFinder.prototype.stopDiscovery = function () {
    if (this.socket) {
        this.socket.end();
        this.socket.destroy();
        this.socket = null;
    }

    if (this.rescanId) {
        clearInterval(this.rescanId);
        this.rescanId = null;
    }
};

exports.LGFinder = LGFinder;

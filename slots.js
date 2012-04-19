/*jslint browser: true, newcap: true, nomen: true */

var Emitter = (function (exports) {
    'use strict';

    var _ = require('underscore');

    /**
     * SlotManager
     */
    function SlotManager(slots) {
        this.slots = slots || [];
    }

    SlotManager.prototype.combine = function (slot) {
        this.slots.push(slot);
    };

    SlotManager.prototype.remove = function () {
        _.each(this.slots, function (slot) {
            slot.remove();
        });
        this.slots = [];
    };

    exports.SlotManager = SlotManager;

    /**
     * Slot 
     */
    function Slot(obj) {
        this.obj = obj;
        this._events = obj.events;
        this._my_events = {};
    }

    Slot.prototype.on = function (name, fn) {
        this._events[name] = this._events[name] || [];
        this._my_events[name] = this._my_events[name] || [];

        this._events[name].push(fn);
        this._my_events[name].push(fn);
    };

    Slot.prototype.remove = function () {
        var self = this;

        // Only remove events if they haven't been removed elsewhere
        if (this.obj._events === this._events) {
            _.each(this._my_events, function (events, name) {
                self._events[name] = _.difference(self._events[name], events);
            });
        }

        // Prevent this function from being called a second time
        this.on = undefined;
        this.remove = undefined;
    };

    Slot.prototype.combine = function (slot) {
        return new SlotManager([this, slot]);
    };

    Slot.prototype.manager = function () {
        return new SlotManager([this]);
    };

    exports.Slot = Slot;

    /**
     * Emitter
     */
    function Emitter() {
        this._events = {};
    }

    Emitter.prototype.on = function (name, fn) {
        var slot = new Slot(this);
        return slot.call(this, name, fn);
    };

    Emitter.prototype.removeEvents = function (name, fn) {
        if (typeof name === 'undefined') {
            this._events = {};
        } else if (typeof fn === 'undefined') {
            delete this._events[name];
        } else {
            this._events[name] = _.filter(this._events[name], function (other) {
                return other !== fn;
            });
        }
        return this;
    };

    Emitter.proxy = function (obj) {
    };

    Emitter.punch = function (obj) {
    };

    exports.Emitter = Emitter;
}(typeof exports === 'undefined' ? window : exports));

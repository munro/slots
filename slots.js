/*jslint browser: true, nomen: true */

var Emitter = (function (_, exports) {
    'use strict';

    var SlotManager, Slot, FnSlot, TimeoutSlot, IntervalSlot;

    function optionalNew(fn) {
        return function wrapper() {
            var obj = this;
            if (typeof this === 'undefined' || !(this instanceof wrapper)) {
                obj = Object.create(wrapper.prototype);
            }
            return fn.apply(obj, arguments);
        };
    }

    /**
     * SlotManager
     */
    SlotManager = optionalNew(function (slots) {
        this.slots = slots || [];
    });

    SlotManager.prototype.combine = function (slot) {
        this.slots.push(slot);
        return this;
    };

    SlotManager.prototype.remove = function () {
        _.each(this.slots, function (slot) {
            slot.remove();
        });
        this.slots = [];
        return this;
    };

    SlotManager.prototype.fn = function () {
        return FnSlot.apply(undefined, arguments);
    };

    SlotManager.prototype.timeout = function () {
        return TimeoutSlot.apply(undefined, arguments);
    };

    SlotManager.prototype.interval = function () {
        return IntervalSlot.apply(undefined, arguments);
    };

    exports.SlotManager = SlotManager;

    /**
     * Slot
     */
    Slot = function (obj) {
    };

    Slot.prototype.combine = function (slot) {
        return new SlotManager([this, slot]);
    };

    Slot.prototype.manager = function () {
        return new SlotManager([this]);
    };

    exports.Slot = Slot;

    /**
     * FnSlot
     */
    FnSlot = function (fn) {
        var attached = true, wrapper;
        wrapper = function () {
            return attached && fn.apply(this, arguments);
        };
        wrapper.remove = function () {
            attached = false;
        };
        _.extend(wrapper, Slot.prototype);
        return wrapper;
    };

    /**
     * Timeout
     */
    TimeoutSlot = optionalNew(function (fn, timeout) {
        this.timer = setTimeout(fn, timeout);
    });

    TimeoutSlot.prototype = Object.create(Slot.prototype);

    TimeoutSlot.remove = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            delete this.timer;
        }
    };

    exports.timeout = TimeoutSlot;

    /**
     * Timeout
     */
    IntervalSlot = optionalNew(function (fn, timeout) {
        this.timer = setInterval(fn, timeout);
    });

    IntervalSlot.prototype = Object.create(Slot.prototype);

    IntervalSlot.remove = function () {
        if (this.timer) {
            clearInterval(this.timer);
            delete this.timer;
        }
    };

    exports.interval = IntervalSlot;

    /**
     * EmitterSlot 
     */
    function EmitterSlot(obj) {
        this.obj = obj;
        this._events = obj.events;
        this._my_events = {};
    }

    EmitterSlot.prototype.on = function (name, fn) {
        this._events[name] = this._events[name] || [];
        this._my_events[name] = this._my_events[name] || [];

        this._events[name].push(fn);
        this._my_events[name].push(fn);
    };

    EmitterSlot.prototype.remove = function () {
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

    /**
     * Emitter
     */
    function Emitter() {
        this._events = {};
    }

    Emitter.prototype.on = function (name, fn) {
        var slot = new EmitterSlot(this);
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
}(
    typeof this._ !== 'undefined' ? this._ : require('underscore'),
    typeof exports === 'undefined' ? this : exports
));

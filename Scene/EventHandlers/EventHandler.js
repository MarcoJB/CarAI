import { EventCallback } from "./EventCallback.js"

class EventHandler {
    constructor(canvas) {
        this.canvas = canvas
        this.eventCallbacks = []
    }

    registerShape(shape, callback, options) {
        this.eventCallbacks.push(new EventCallback(shape, callback, options))
    }

    deregisterShape(shape) {
        for (let i = this.eventCallbacks.length - 1; i >= 0; i--) {
            if (this.eventCallbacks[i].shape === shape) {
                this.eventCallbacks.splice(i, 1)
            }
        }
    }

    deregisterAllShapes() {
        this.eventCallbacks = []
    }
}

export {EventHandler}
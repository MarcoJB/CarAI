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
        this.eventCallbacks.every((eventCallback, index) => {
            if (eventCallback.shape === shape) {
                this.eventCallbacks.splice(index, 1)
                return false // end searching for correct element
            }
            return true // continue searching for correct element
        })
    }

    deregisterAllShapes() {
        this.eventCallbacks = []
    }
}

export {EventHandler}
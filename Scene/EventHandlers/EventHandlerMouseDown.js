import { EventHandler } from "./EventHandler.js"
import { Vector2D } from "../../Vector/Vector2D.js"

class EventHandlerMouseDown extends EventHandler {
    constructor(canvas) {
        super(canvas)

        this.canvas.addEventListener("mousedown", e => this.handleEventCallbacks(e))
    }

    handleEventCallbacks(e) {
        const mousePosition = new Vector2D(e.offsetX, e.offsetY)
        this.eventCallbacks.forEach(eventCallback => {
            // check all options to be satisfied
            for (let option in eventCallback.options) {
                if (eventCallback.options[option] !== e[option]) return false
            }

            if (eventCallback.shape.contains(mousePosition)) {
                eventCallback.callback(e)
            }
        })
    }
}

export {EventHandlerMouseDown}
import { EventHandler } from "./EventHandler.js"
import { Shaper } from "../../Shaper.js"

class EventHandlerClick extends EventHandler {
    constructor(canvas) {
        super(canvas)

        this.canvas.addEventListener("click", e => this.handleEventCallbacks(e))
    }

    handleEventCallbacks(e) {
        const mousePosition = new Shaper.Vector(e.offsetX, e.offsetY)
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

export {EventHandlerClick}
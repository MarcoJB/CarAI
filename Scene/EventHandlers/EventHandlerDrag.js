import { EventHandler } from "./EventHandler.js"
import { Vector2D } from "../../Vector/Vector2D.js"

class EventHandlerDrag extends EventHandler {
    constructor(canvas) {
        super(canvas)

        this.dragStartPosition = null
        this.draggingEventCallback = null

        this.canvas.addEventListener("mousedown", e => this.handleMouseDown(e))
        this.canvas.addEventListener("mousemove", e => this.handleMouseMove(e))
        window.addEventListener("mouseup", e => this.handleMouseUp(e))
    }

    handleMouseDown(e) {
        const mousePosition = new Vector2D(e.offsetX, e.offsetY)

        this.eventCallbacks.every(eventCallback => {
            if (eventCallback.shape.contains(mousePosition)) {
                this.dragStartPosition = mousePosition
                this.draggingEventCallback = eventCallback

                return false
            }

            return true
        })

    }

    handleMouseMove(e) {
        if (this.draggingEventCallback) {
            const mousePosition = new Vector2D(e.offsetX, e.offsetY)

            const offset = Vector2D.sub(mousePosition, this.dragStartPosition)

            this.draggingEventCallback.callback(e, offset)

            this.dragStartPosition = mousePosition
        }
    }

    handleMouseUp(e) {
        this.draggingEventCallback = null
    }
}

export {EventHandlerDrag}
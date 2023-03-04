import { EventHandlerClick } from "./EventHandlers/EventHandlerClick.js"
import { EventHandlerMouseDown } from "./EventHandlers/EventHandlerMouseDown.js"
import { EventHandlerContextmenu } from "./EventHandlers/EventHandlerContextmenu.js"
import { EventHandlerDrag } from "./EventHandlers/EventHandlerDrag.js"
import { Container } from "./Shapes/Container.js"
import { Vector2D } from "../Vector/Vector2D.js"

class Scene {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.eventHandlers = {}

        this.rootShape = new Container()

        this.eventHandlers["click"] = new EventHandlerClick(this.canvas)
        this.eventHandlers["mousedown"] = new EventHandlerMouseDown(this.canvas)
        this.eventHandlers["contextmenu"] = new EventHandlerContextmenu(this.canvas)
        this.eventHandlers["drag"] = new EventHandlerDrag(this.canvas)

        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault())
    }

    addShape(shape) {
        this.rootShape.addChildShape(shape)
    }

    removeShape(shape) {
        this.rootShape.removeChildShape(shape)
        this.removeAllEventListenersFromShape(shape)
    }

    reset() {
        this.shapes = []
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for (let event in this.eventHandlers) this.eventHandlers[event].deregisterAllShapes()
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.rootShape.render(this.context)
    }

    addEventListener(event, shape, callback, options) {
        if (!this.eventHandlers[event]) {
            console.error("Event unknown: " + event)
            return
        } else {
            this.eventHandlers[event].registerShape(shape, callback, options)
        }
    }

    removeEventListeners(event, shape) {
        if (!this.eventHandlers[event]) {
            console.error("Event unknown: " + event)
            return
        } else {
            this.eventHandlers[event].deregisterShape(shape)
        }
    }

    removeAllEventListenersFromShape(shape) {
        for(let event in this.eventHandlers) {
            this.eventHandlers[event].deregisterShape(shape)
        }
    }
}

export {Scene}
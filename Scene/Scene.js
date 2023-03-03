import { EventHandlerClick } from "./EventHandlers/EventHandlerClick.js"
import { EventHandlerContextmenu } from "./EventHandlers/EventHandlerContextmenu.js"
import { EventHandlerDrag } from "./EventHandlers/EventHandlerDrag.js"

class Scene {
    constructor(canvas) {
        this.canvas = canvas
        this.context = canvas.getContext('2d')
        this.shapes = []
        this.eventHandlers = {}

        this.eventHandlers["click"] = new EventHandlerClick(this.canvas)
        this.eventHandlers["contextmenu"] = new EventHandlerContextmenu(this.canvas)
        this.eventHandlers["drag"] = new EventHandlerDrag(this.canvas)

        this.canvas.addEventListener("contextmenu", (e) => e.preventDefault())
    }

    addShape(shape) {
        this.shapes.push(shape)
    }

    removeShape(shape) {
        this.shapes.splice(this.shapes.indexOf(shape), 1)
    }

    clear() {
        this.shapes = []
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        for (let event in this.eventHandlers) this.eventHandlers[event].deregisterAllShapes()
    }

    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height)
        this.shapes.sort((shape1, shape2) => shape1.zIndex - shape2.zIndex)
            .forEach(shape => shape.render(this.context))
    }

    addEventListener(event, shape, callback, options) {
        if (!this.shapes.includes(shape)) {
            console.error("Shape unknown.")
            return
        }

        if (!this.eventHandlers[event]) {
            console.error("Event unknown.")
            return
        } else {
            this.eventHandlers[event].registerShape(shape, callback, options)
        }
    }

    makeShapeDraggable(shape) {

    }
}

export {Scene}
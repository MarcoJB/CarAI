import { Vector2D } from "../../Vector/Vector2D.js"
import { Shape } from "./Shape.js"

class Line extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.start = config.start || Vector2D.zero()
        this.end = config.end || Vector2D.zero()
    }

    render(context) {
        super.render(context)

        const absoluteStart = this.absolutePosition(this.start)
        const absoluteEnd = this.absolutePosition(this.end)

        context.beginPath()
        context.moveTo(absoluteStart.x, absoluteStart.y)
        context.lineTo(absoluteEnd.x, absoluteEnd.y)
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth
            context.strokeStyle = this.strokeColor
            context.stroke()
        }
    }
}

export {Line}
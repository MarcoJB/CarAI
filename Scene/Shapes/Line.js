import { Vector2D } from "../../Vector/Vector2D.js"
import { Shape } from "./Shape.js"

class Line extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.points = config.points || [Vector2D.zero(), Vector2D.zero()]
    }

    render(context) {
        super.render(context)

        const absolutePoints = [
            this.absolutePosition(this.points[0]),
            this.absolutePosition(this.points[1])
        ]

        context.beginPath()
        context.moveTo(absolutePoints[0].x, absolutePoints[0].y)
        context.lineTo(absolutePoints[1].x, absolutePoints[1].y)
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth
            context.strokeStyle = this.strokeColor
            context.stroke()
        }
    }
}

export {Line}
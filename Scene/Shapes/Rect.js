import { Shaper } from "../../Shaper.js"
import { Shape } from "./Shape.js"

class Rect extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.points = config.points || [Shaper.Vector.zero(), Shaper.Vector.zero(), Shaper.Vector.zero(), Shaper.Vector.zero()]
    }

    render(context) {
        super.render(context)

        const absolutePoints = [
            this.absolutePosition(this.points[0]),
            this.absolutePosition(this.points[1]),
            this.absolutePosition(this.points[2]),
            this.absolutePosition(this.points[3]),
        ]

        context.beginPath()
        context.moveTo(absolutePoints[0].x, absolutePoints[0].y)
        context.lineTo(absolutePoints[1].x, absolutePoints[1].y)
        context.lineTo(absolutePoints[2].x, absolutePoints[2].y)
        context.lineTo(absolutePoints[3].x, absolutePoints[3].y)
        if (this.fillColor) {
            context.fillStyle = this.fillColor
            context.fill()
        }
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth
            context.strokeStyle = this.strokeColor
            context.stroke()
        }
    }
}

export {Rect}
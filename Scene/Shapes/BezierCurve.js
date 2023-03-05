import { Vector2D } from "../../Vector/Vector2D.js"
import { Line } from "./Line.js"
import { Shape } from "./Shape.js"

class BezierCurve extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.points = config.points || [Vector2D.zero(), Vector2D.zero(), Vector2D.zero(), Vector2D.zero()]
    }

    contains(position) {
        if (super.contains(position)) return true

        const resolution = 100
        for (let t = 0; t <= resolution; t++) {
            if (Vector2D.sub(this.relativePosition(position), this.getPointOnLine(t/resolution)).length() 
                <= this.strokeWidth / 2) return true
        }
        return false
    }

    getPointOnLine(t) {
        // explicit form of cubic bezier curve
        return Vector2D.exec(
            (p0, p1, p2, p3) => (1-t)**3 * p0 + 3 * (1-t)**2 * t * p1 + 3 * (1-t) * t**2 * p2 + t**3 * p3, 
            this.points
        )
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
        context.bezierCurveTo(
            absolutePoints[1].x, absolutePoints[1].y,
            absolutePoints[2].x, absolutePoints[2].y,
            absolutePoints[3].x, absolutePoints[3].y,
        )

        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth
            context.strokeStyle = this.strokeColor
            context.stroke()
        }
    }
}

export {BezierCurve}
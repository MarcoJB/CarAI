import { Vector2D } from "../../Vector/Vector2D.js"
import { Line } from "./Line.js"
import { Shape } from "./Shape.js"

class BezierCurve extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.point1 = config.point1 || Vector2D.zero()
        this.point2 = config.point2 || Vector2D.zero()
        this.point3 = config.point3 || Vector2D.zero()
        this.point4 = config.point4 || Vector2D.zero()
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
            [this.point1, this.point2, this.point3, this.point4]
        )
    }

    render(context) {
        super.render(context)

        const absolutePoint1 = this.absolutePosition(this.point1)
        const absolutePoint2 = this.absolutePosition(this.point2)
        const absolutePoint3 = this.absolutePosition(this.point3)
        const absolutePoint4 = this.absolutePosition(this.point4)

        context.beginPath()
        context.moveTo(absolutePoint1.x, absolutePoint1.y)
        context.bezierCurveTo(
            absolutePoint2.x, absolutePoint2.y,
            absolutePoint3.x, absolutePoint3.y,
            absolutePoint4.x, absolutePoint4.y,
        )

        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth
            context.strokeStyle = this.strokeColor
            context.stroke()
        }
    }
}

export {BezierCurve}
import { Vector2D } from "../../Vector/Vector2D.js"
import { Shape } from "./Shape.js"

class BezierCurve extends Shape {
    constructor(config) {
        super(config)

        this.x1 = config.x1 || 0
        this.y1 = config.y1 || 0
        this.x2 = config.x2 || 0
        this.y2 = config.y2 || 0
        this.x3 = config.x3 || 0
        this.y3 = config.y3 || 0
        this.x4 = config.x4 || 0
        this.y4 = config.y4 || 0
    }

    move(vector) {
        this.x1 += vector.x1
        this.y1 += vector.y1
        this.x2 += vector.x2
        this.y2 += vector.y2
        this.x3 += vector.x3
        this.y3 += vector.y3
        this.x4 += vector.x4
        this.y4 += vector.y4
    }

    contains(position, resolution=100) {
        for (let t = 0; t <= resolution; t++) {
            if (Vector2D.subtract(position, this.getPointOnLine(t/resolution)).length() 
                <= this.strokeWidth) return true
        }
        return false
    }

    getPointOnLine(t) {
        return new Vector2D(
            (1-t)**3 * this.x1 + 3 * (1-t)**2 * t * this.x2 + 3 * (1-t) * t**2 * this.x3 + t**3 * this.x4,
            (1-t)**3 * this.y1 + 3 * (1-t)**2 * t * this.y2 + 3 * (1-t) * t**2 * this.y3 + t**3 * this.y4
        )
    }

    render(context) {
        context.beginPath();
        context.moveTo(this.x1, this.y1);
        context.bezierCurveTo(this.x2, this.y2, this.x3, this.y3, this.x4, this.y4);
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth;
            context.strokeStyle = this.strokeColor;
            context.stroke();
        }
    }
}

export {BezierCurve}
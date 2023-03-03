import { Shape } from "./Shape.js"
import { Vector2D } from "../../Vector/Vector2D.js"

class Circle extends Shape {
    constructor(config) {
        super(config)

        this.x = config.x || 0
        this.y = config.y || 0
        this.radius = config.radius || 0
    }

    move(vector) {
        this.x += vector.x
        this.y += vector.y
    }

    contains(position) {
        return Vector2D.subtract(position, new Vector2D(this.x, this.y)).length() <= this.radius
    }

    render(context) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        if (this.fillColor) {
            context.fillStyle = this.fillColor;
            context.fill();
        }
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth;
            context.strokeStyle = this.strokeColor;
            context.stroke();
        }
    }
}

export {Circle}
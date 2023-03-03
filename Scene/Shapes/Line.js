import { Shape } from "./Shape.js"

class Line extends Shape {
    constructor(config) {
        super(config)

        this.x1 = config.x1 || 0
        this.y1 = config.y1 || 0
        this.x2 = config.x2 || 0
        this.y2 = config.y2 || 0
    }

    move(vector) {
        this.x1 += vector.x1
        this.y1 += vector.y1
        this.x2 += vector.x2
        this.y2 += vector.y2
    }

    render(context) {
        context.beginPath();
        context.moveTo(this.x1, this.y1);
        context.lineTo(this.x2, this.y2);
        if (this.strokeColor) {
            context.lineWidth = this.strokeWidth;
            context.strokeStyle = this.strokeColor;
            context.stroke();
        }
    }
}

export {Line}
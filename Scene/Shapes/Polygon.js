import { Shape } from "./Shape.js";

class Polygon extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.points = config.points || []
        this.holes = config.holes || []
    }

    render(context) {
        super.render(context)

        if (this.points.length > 0) {
            const absolutePoints = []
            this.points.forEach(point => absolutePoints.push(this.absolutePosition(point)))

            context.beginPath()
            context.moveTo(absolutePoints[0].x, absolutePoints[0].y)
            absolutePoints.forEach(point => context.lineTo(point.x, point.y))
            context.closePath()

            this.holes.forEach(holePoints => {
                if (holePoints.length > 0) {
                    const absolutePoints = []
                    holePoints.forEach(point => absolutePoints.push(this.absolutePosition(point)))

                    context.moveTo(absolutePoints[0].x, absolutePoints[0].y)
                    absolutePoints.forEach(point => context.lineTo(point.x, point.y))
                    context.closePath()
                }
            })


            if (this.strokeColor) {
                context.lineWidth = this.strokeWidth
                context.strokeStyle = this.strokeColor
                context.stroke()
            }
            if (this.fillColor) {
                context.fillStyle = this.fillColor
                context.fill()
            }
        }
    }
}

export {Polygon}
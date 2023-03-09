import { Shape } from "./Shape.js"
import { Shaper } from "../../Shaper.js"

class Circle extends Shape {
    constructor(config) {
        super(config)

        config = config || {}
        
        this.center = config.center || Shaper.Vector.zero()
        this.radius = config.radius || 0
    }

    contains(position) {
        if (super.contains(position)) return true
        
        return Shaper.Vector.sub(
            this.relativePosition(position), 
            new Shaper.Vector(this.center.x, this.center.y)
        ).length() <= this.radius
    }

    render(context) {
        super.render(context)

        const absoluteCenter = this.absolutePosition(this.center)

        context.beginPath()
        context.arc(absoluteCenter.x, absoluteCenter.y, this.radius, 0, 2 * Math.PI)
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

export {Circle}
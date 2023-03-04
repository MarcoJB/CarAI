import { Vector2D } from "../../Vector/Vector2D.js"

class Shape {
    constructor(config) {
        config = config || {}
        
        this.fillColor = config.fillColor || null
        this.strokeColor = config.strokeColor || null
        this.strokeWidth = config.strokeWidth || 0
        this.zIndex = config.zIndex || 0
        this.rotation = config.rotation || 0
        this.parentShape = config.parentShape || null
        this.position = config.position || Vector2D.zero()
        this.childShapes = []

        if (config.childShapes) {
            config.childShapes.forEach(shape => {
                this.addChildShape(shape)
            })
        }
    }

    addChildShape(shape) {
        if (!this.childShapes.includes(shape)) {
            this.childShapes.push(shape)
            shape.updateParentShape(this)
        }
    }

    removeChildShape(shape) {
        if (this.childShapes.includes(shape)) {
            this.childShapes.splice(this.childShapes.indexOf(shape), 1)
            shape.removeParentShape(false)
        }
    }

    updateParentShape(shape) {
        if (!this.parentShape || this.parentShape !== shape) {
            this.removeParentShape()
            this.parentShape = shape
            shape.addChildShape(this)
        }
    }

    removeParentShape() {
        if (this.parentShape) {
            const oldParentShape = this.parentShape
            this.parentShape = null
            oldParentShape.removeChildShape(this)
        }
    }

    setFillColor(fillColor) {
        this.fillColor = fillColor
    }

    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor
    }

    setStrokeWidth(strokeWidth) {
        this.strokeWidth = strokeWidth
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex
    }

    move() {}

    contains(position) {
        for (let i in this.childShapes) {
            if (this.childShapes[i].contains(position)) return true
        }

        return false
    }

    addToScene(scene) {
        scene.addShape(this)
        return this
    }

    absolutePosition(point) {
        point = Vector2D.add(point.rotate(this.rotation), this.position)
        
        if (this.parentShape) point = this.parentShape.absolutePosition(point)
        
        return point
    }

    relativePosition(point) {
        if (this.parentShape) point = this.parentShape.relativePosition(point)

        point = Vector2D.sub(point, this.position).rotate(-this.rotation)

        return point
    }

    render(context) {
        this.childShapes.sort((shape1, shape2) => shape1.zIndex - shape2.zIndex)
            .forEach(shape => shape.render(context))
    }
}

export {Shape}
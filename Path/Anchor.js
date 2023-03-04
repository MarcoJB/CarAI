import { Vector2D } from "../Vector/Vector2D.js"

class Anchor {
    constructor(x, y, width=50) {
        this.position = new Vector2D(x, y)
        this.width = width
        this.controlPoints = [Vector2D.zero(), Vector2D.zero()]
        this.previousAnchor = null
        this.nextAnchor = null
    }

    setPosition(position) {
        this.position = position
        this.calculateControlPoints()
    }

    setX(x) {
        this.position.x = x
        this.calculateControlPoints()
    }

    setY(y) {
        this.position.y = y
        this.calculateControlPoints()
    }

    calculateControlPoints() {
        const vectorToPreviousAchor = Vector2D.sub(this.previousAnchor.position, this.position)
        const vectorToNextAchor = Vector2D.sub(this.nextAnchor.position, this.position)

        const direction = Vector2D.add(
            vectorToPreviousAchor.normalize(), 
            vectorToNextAchor.normalize()
        ).normalize().rotate(Math.PI/2)

        this.controlPoints = [
            Vector2D.add(this.position, Vector2D.mul(direction, Math.sign(Vector2D.dot(vectorToPreviousAchor, direction)) * 0.4 * vectorToPreviousAchor.length())),
            Vector2D.add(this.position, Vector2D.mul(direction, Math.sign(Vector2D.dot(vectorToNextAchor, direction)) * 0.4 * vectorToNextAchor.length()))
        ]
    }
}

export {Anchor}
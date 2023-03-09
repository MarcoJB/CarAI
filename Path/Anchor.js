import { Shaper } from "../Shaper.js"

class Anchor {
    constructor(x, y, width=50) {
        this.position = new Shaper.Vector(x, y)
        this.width = width
        this.controlPoints = [Shaper.Vector.zero(), Shaper.Vector.zero()]
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
        const vectorToPreviousAchor = Shaper.Vector.sub(this.previousAnchor.position, this.position)
        const vectorToNextAchor = Shaper.Vector.sub(this.nextAnchor.position, this.position)

        const direction = Shaper.Vector.add(
            vectorToPreviousAchor.normalize(), 
            vectorToNextAchor.normalize()
        ).normalize().rotate(Math.PI/2)

        this.controlPoints = [
            Shaper.Vector.add(this.position, Shaper.Vector.mul(direction, Math.sign(Shaper.Vector.dot(vectorToPreviousAchor, 
                direction)) * 0.4 * vectorToPreviousAchor.length())),
            Shaper.Vector.add(this.position, Shaper.Vector.mul(direction, Math.sign(Shaper.Vector.dot(vectorToNextAchor, 
                direction)) * 0.4 * vectorToNextAchor.length()))
        ]
    }
}

export {Anchor}
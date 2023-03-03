import { Vector2D } from "../Vector/Vector2D.js"
import { Vector3D } from "../Vector/Vector3D.js"

class Anchor {
    position
    previousAnchor
    nextAnchor

    constructor(x, y) {
        this.position = new Vector2D(x, y)
    }

    controlPoints() {
        if (this.previousAnchor === this.nextAnchor) {
            console.error("previousAnchor and nextAnchor are identical.")
            return
        }

        const vectorToPreviousAchor = Vector2D.subtract(this.previousAnchor.position, this.position)
        const vectorToNextAchor = Vector2D.subtract(this.nextAnchor.position, this.position)

        const direction = Vector2D.add(vectorToPreviousAchor.normalize(), vectorToNextAchor.normalize()).normalize().crossProduct(Vector3D.ez)

        return [
            Vector2D.add(this.position, Vector2D.multiply(direction, Math.sign(Vector2D.dotProduct(vectorToPreviousAchor, direction)) * 0.4 * vectorToPreviousAchor.length())),
            Vector2D.add(this.position, Vector2D.multiply(direction, Math.sign(Vector2D.dotProduct(vectorToNextAchor, direction)) * 0.4 * vectorToNextAchor.length()))
        ]
    }
}

export {Anchor}
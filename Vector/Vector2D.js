import { Vector3D } from "../Vector/Vector3D.js"

class Vector2D extends Vector3D {
    constructor(x, y) {
        super(x, y, 0)
    }
}

export {Vector2D}
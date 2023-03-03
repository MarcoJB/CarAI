class Vector3D {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    length() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }

    add(vector) {
        return Vector3D.add(this, vector)
    }

    subtract(vector) {
        return Vector3D.subtract(this, vector)
    }

    multiply(factor) {
        return Vector3D.multiply(this, factor)
    }

    crossProduct(vector) {
        return Vector3D.crossProduct(this, vector)
    }

    normalize() {
        return Vector3D.normalize(this)
    }

    static ex = new Vector3D(1, 0, 0)
    static ey = new Vector3D(0, 1, 0)
    static ez = new Vector3D(0, 0, 1)

    static add(vector1, vector2) {
        return new Vector3D(
            vector1.x + vector2.x,
            vector1.y + vector2.y,
            vector1.z + vector2.z
        )
    }

    static subtract(vector1, vector2) {
        return new Vector3D(
            vector1.x - vector2.x,
            vector1.y - vector2.y,
            vector1.z - vector2.z
        )
    }

    static multiply(vector, factor) {
        return new Vector3D(
            factor * vector.x,
            factor * vector.y,
            factor * vector.z
        )
    }

    static crossProduct(vector1, vector2) {
        return new Vector3D(
            vector1.y*vector2.z - vector1.z*vector2.y,
            vector1.z*vector2.x - vector1.x*vector2.z,
            vector1.x*vector2.y - vector1.y*vector2.x
        )
    }

    static dotProduct(vector1, vector2) {
        return vector1.x*vector2.x + vector1.y*vector2.y + vector1.z*vector2.z
    }

    static normalize(vector) {
        const vectorLength = vector.length()

        return new Vector3D(
            vector.x / vectorLength,
            vector.y / vectorLength,
            vector.z / vectorLength
        )
    }
}

export {Vector3D}
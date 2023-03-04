class Vector3D {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    length() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }

    add(...vectors) {
        return Vector3D.add(this, ...vectors)
    }

    sub(vector) {
        return Vector3D.sub(this, vector)
    }

    mul(factor) {
        return Vector3D.mul(this, factor)
    }

    cross(vector) {
        return Vector3D.cross(this, vector)
    }

    dot(vector) {
        return Vector3D.dot(this, vector)
    }

    normalize() {
        return Vector3D.normalize(this)
    }


    static ex = new Vector3D(1, 0, 0)
    static ey = new Vector3D(0, 1, 0)
    static ez = new Vector3D(0, 0, 1)
    static zero = new Vector3D(0, 0, 0)

    static add(...vectors) {
        return new Vector3D(
            vectors.reduce((total, vector) => total + vector.x, 0),
            vectors.reduce((total, vector) => total + vector.y, 0),
            vectors.reduce((total, vector) => total + vector.z, 0),
        )
    }

    static sub(vector1, vector2) {
        return new Vector3D(
            vector1.x - vector2.x,
            vector1.y - vector2.y,
            vector1.z - vector2.z
        )
    }

    static mul(vector, factor) {
        return new Vector3D(
            factor * vector.x,
            factor * vector.y,
            factor * vector.z
        )
    }

    static cross(vector1, vector2) {
        return new Vector3D(
            vector1.y*vector2.z - vector1.z*vector2.y,
            vector1.z*vector2.x - vector1.x*vector2.z,
            vector1.x*vector2.y - vector1.y*vector2.x
        )
    }

    static dot(vector1, vector2) {
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

    static exec(func, vectors) {
        return new Vector3D(
            func(...vectors.map(vector => vector.x)),
            func(...vectors.map(vector => vector.y)),
            func(...vectors.map(vector => vector.z)),
        )
    }
}

export {Vector3D}
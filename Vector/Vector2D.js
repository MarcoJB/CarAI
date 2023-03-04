class Vector2D {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    length() {
        return Vector2D.length(this)
    }

    add(...vectors) {
        return Vector2D.add(this, ...vectors)
    }

    sub(vector) {
        return Vector2D.sub(this, vector)
    }

    mul(factor) {
        return Vector2D.mul(this, factor)
    }

    dot(vector) {
        return Vector2D.dot(this, vector)
    }

    normalize() {
        return Vector2D.normalize(this)
    }

    rotate(angle) {
        return Vector2D.rotate(this, angle)
    }

    static ex() {return new Vector2D(1, 0)}
    static ey() {return new Vector2D(0, 1)}
    static zero() {return new Vector2D(0, 0)}

    static length(vector) {
        return Math.sqrt(vector.x**2 + vector.y**2)
    }

    static add(...vectors) {
        return new Vector2D(
            vectors.reduce((total, vector) => total + vector.x, 0),
            vectors.reduce((total, vector) => total + vector.y, 0),
        )
    }

    static sub(vector1, vector2) {
        return new Vector2D(
            vector1.x - vector2.x,
            vector1.y - vector2.y,
        )
    }

    static mul(vector, factor) {
        return new Vector2D(
            factor * vector.x,
            factor * vector.y,
        )
    }

    static dot(vector1, vector2) {
        return vector1.x*vector2.x + vector1.y*vector2.y
    }

    static normalize(vector) {
        const vectorLength = vector.length()

        return new Vector2D(
            vector.x / vectorLength,
            vector.y / vectorLength,
        )
    }

    static rotate(vector, angle) {
        return new Vector2D(
            vector.y * Math.sin(angle) + vector.x * Math.cos(angle),
            vector.y * Math.cos(angle) - vector.x * Math.sin(angle),
        )
    }

    static exec(func, vectors) {
        return new Vector2D(
            func(...vectors.map(vector => vector.x)),
            func(...vectors.map(vector => vector.y)),
        )
    }
}

export {Vector2D}
class Shaper {
    
}


class Path {
    constructor(points, closed=true) {
        this.points = points || []
        this.closed = closed
    }

    addPoint(point) {
        if (point && point instanceof Vector) {
            this.points.push(point)
        }
    }

    removePoint(point) {
        if (point && point instanceof Vector && this.points.includes(point)) {
            this.points.splice(this.points.indexOf(point), 1)
        }
    }

    at(index) {
        return this.points[(index + this.points.length) % this.points.length]
    }

    /*offset(offset) {return Shaper.Path.offset(this, offset)}

    static offset(path, offset) {
        if (offset === 0) return path

        const segments = []
        path.points.forEach((point, index) => {
            segments.push(new Line(point, path.at(index+1)))
        })

        const remainingSegments = []
        segments.forEach((segment, index) => {
            console.log(index)

            const segment1 = segment
            const segment2 = segments.loopIndex(index+1)
            const segment3 = segments.loopIndex(index+2)
            
            const normal1 = segment1.normal()
            const normal2 = segment2.normal()
            const normal3 = segment3.normal()
            console.log("Normals", normal1, normal2, normal3)

            const bisector1 = Vector.add(normal1, normal2).normalize()
            const bisector2 = Vector.add(normal2, normal3).normalize()
            console.log("Bisectors", bisector1, bisector2)

            const bisectorLine1 = Line.fromStartPointAndDirection(segment2.startPoint, bisector1)
            const bisectorLine2 = Line.fromStartPointAndDirection(segment3.startPoint, bisector2)
            console.log("Bisectorlines", bisectorLine1, bisectorLine2)

            const intersection = Line.intersection(bisectorLine1, bisectorLine2)
            console.log("Intersection", intersection)

            const distance = intersection.sub(segment2.startPoint).dot(segment2.normal(), true)
            console.log("Distance", distance)

            if (distance < offset) {
                
            }
        })
    }*/
}
Shaper.Path = Path


class Line {
    constructor(startPoint, endPoint, endless=true) {
        this.startPoint = startPoint || Vector.zero()
        this.endPoint = endPoint || Vector.zero()
        this.endless = endless
    }

    // Map object methods to static methods
    direction() {return Line.direction(this)}
    normal() {return Line.normal(this)}
    intersection(line) {return Line.intersection(this, line)}
    distanceToPoint(point, signed=false) {return Line.distanceToPoint(this, point, signed)}

    static fromStartPointAndDirection(startPoint, direction) {
        return new Line(
            startPoint,
            startPoint.add(direction)
        )
    }

    static direction(line) {
        return Vector.sub(line.endPoint, line.startPoint).normalize()
    }

    static normal(line) {
        return line.direction().rotate(Math.PI / 2)
    }

    static distanceToPoint(line, point, signed=false) {
        const pointVector = point.sub(line.startPoint)
        if (signed) return pointVector.dot(line.normal())
        else return Math.abs(pointVector.dot(line.normal()))
    }

    static intersection(line1, line2) {
        const line1Start = line1.startPoint
        const line1End = line1.endPoint
        const line2Start = line2.startPoint
        const line2End = line2.endPoint

        const denominator = ((line2End.y - line2Start.y) * (line1End.x - line1Start.x)) - 
        ((line2End.x - line2Start.x) * (line1End.y - line1Start.y))

        if (denominator === 0) {
            return null // lines are parallel
        }

        let ua = (((line2End.x - line2Start.x) * (line1Start.y - line2Start.y)) - 
        ((line2End.y - line2Start.y) * (line1Start.x - line2Start.x))) / denominator
        let ub = (((line1End.x - line1Start.x) * (line1Start.y - line2Start.y)) - 
        ((line1End.y - line1Start.y) * (line1Start.x - line2Start.x))) / denominator

        if (!line1.endless && (ua < 0 || ua > 1)) {
            return null  // lines do not intersect within 1. segment
        }
        if (!line2.endless && (ub < 0 || ub > 1)) {
            return null  // lines do not intersect within 2. segment
        }

        return new Shaper.Vector(
            line1Start.x + ua * (line1End.x - line1Start.x),
            line1Start.y + ua * (line1End.y - line1Start.y)
        );
    }
}
Shaper.Line = Line


class Vector {
    constructor(x, y) {
        this.x = x
        this.y = y
    }

    // Map object methods to static methods
    add(vector) {return Vector.add(this, vector)}
    addN(vectors) {return Vector.addN([this].concat(vectors))}
    sub(vector) {return Vector.sub(this, vector)}
    mul(factor) {return Vector.mul(this, factor)}
    div(factor) {return Vector.div(this, factor)}
    rotate(angle) {return Vector.rotate(this, angle)}
    normalize() {return Vector.normalize(this)}
    length() {return Vector.length(this)}
    dot(vector) {return Vector.dot(this, vector)}
    distanceToLine(line, signed=false) {return Vector.distanceToLine(this, line, signed)}
    distanceTo(vector) {return Vector.distance(this, vector)}
    projectOnto(vector) {return Vector.project(this, vector)}


    static ex() {return new Vector(1, 0)}
    static ey() {return new Vector(0, 1)}
    static zero() {return new Vector(0, 0)}

    static length(vector) {
        return Math.sqrt(vector.x**2 + vector.y**2)
    }

    static add(vector1, vector2) {
        return new Vector(
            vector1.x + vector2.x,
            vector1.y + vector2.y,
        )
    }

    static addN(vectors) {
        return new Vector(
            vectors.reduce((total, vector) => total + vector.x, 0),
            vectors.reduce((total, vector) => total + vector.y, 0),
        )
    }

    static sub(vector1, vector2) {
        return new Vector(
            vector1.x - vector2.x,
            vector1.y - vector2.y,
        )
    }

    static mul(vector, factor) {
        return new Vector(
            factor * vector.x,
            factor * vector.y,
        )
    }

    static div(vector, factor) {
        return new Vector(
            vector.x / factor,
            vector.y / factor,
        )
    }

    static dot(vector1, vector2) {
        return vector1.x*vector2.x + vector1.y*vector2.y
    }

    static normalize(vector) {
        const vectorLength = vector.length()

        return new Vector(
            vector.x / vectorLength,
            vector.y / vectorLength,
        )
    }

    static rotate(vector, angle) {
        return new Vector(
            vector.y * Math.sin(angle) + vector.x * Math.cos(angle),
            vector.y * Math.cos(angle) - vector.x * Math.sin(angle),
        )
    }

    static distanceToLine(vector, line, signed=false) {
        return Line.distanceToPoint(line, vector, signed)
    }

    static distance(vector1, vector2) {
        return Vector.sub(vector1, vector2).length()
    }

    static project(vector1, vector2) {
        const scalar = Vector.dot(vector1, vector2) / Vector.dot(vector2, vector2);
        return Vector.mul(vector2, scalar);
    }

    static exec(func, vectors) {
        return new Vector(
            func(...vectors.map(vector => vector.x)),
            func(...vectors.map(vector => vector.y)),
        )
    }
}
Shaper.Vector = Vector


export {Shaper}
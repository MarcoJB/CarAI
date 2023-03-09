import { Shaper } from "../Shaper.js"

class Path {
    constructor(anchors=null) {
        this.anchors = anchors || []

        this.update()
    }

    addAnchor(anchor) {
        this.anchors.push(anchor)
        this.update()
    }

    addAnchorAt(anchor, position) {
        this.anchors.splice(position, 0, anchor)
        this.update()
    }

    addAnchorAfter(newAnchor, previousAnchor) {
        this.anchors.splice(this.anchors.indexOf(previousAnchor) + 1, 0, newAnchor)
        this.update()
    }

    removeAnchor(anchor) {
        this.anchors.splice(this.anchors.indexOf(anchor), 1)
        this.update()
    }

    setStartAnchor(anchor) {
        if (!this.anchors.includes(anchor)) return

        this.anchors = this.anchors.concat(this.anchors.splice(0, this.anchors.indexOf(anchor)))

        this.update()
    }

    reverseAnchors() {
        this.anchors = this.anchors.concat(this.anchors.splice(0, 1))
        this.anchors.reverse()
        this.update()
    }

    update() {
        this.calculateNeighborAnchors()
        this.calculataAnchorControlPoints()
    }

    calculateNeighborAnchors() {
        for (let i = 0; i < this.anchors.length; i++) {
            this.anchors[i].previousAnchor = this.anchors[this.loopIndex(i-1)]
            this.anchors[i].nextAnchor = this.anchors[this.loopIndex(i+1)]
        }
    }

    calculataAnchorControlPoints() {
        this.anchors.forEach(anchor => anchor.calculateControlPoints())
    }

    getLinearizedPath(anchor, resolution=10) {
        const linearizationPoints = []

        for (let t = 0; t <= resolution; t++) {
            linearizationPoints.push(this.getPointOnPath(anchor, t/resolution))
        }

        return linearizationPoints
    }

    getLinearizedSegmentBorders(anchor, resolution=10) {
        const linearizedSegmentBorders = [new Shaper.Path(), new Shaper.Path()]

        for (let t = 0; t <= resolution; t++) {
            const pointsOnBorder = this.getPointsOnBorder(anchor, t/resolution)
            linearizedSegmentBorders[0].addPoint(pointsOnBorder[0])
            linearizedSegmentBorders[1].addPoint(pointsOnBorder[1])
        }

        return linearizedSegmentBorders
    }

    getLinearizedBorders(resolution=10) {
        const linearizedBorders = [new Shaper.Path(), new Shaper.Path()]

        this.anchors.forEach(anchor => {
            const linearizedSegmentBorders = this.getLinearizedSegmentBorders(anchor, resolution)
            linearizedBorders[0].points.push(...linearizedSegmentBorders[0].points.slice(0, -1))
            linearizedBorders[1].points.push(...linearizedSegmentBorders[1].points.slice(0, -1))
        })

        // Ensure that the first border is the outer border
        const minXOfBorder1 = Math.min(...linearizedBorders[0].points.map(point => point.x))
        const minXOfBorder2 = Math.min(...linearizedBorders[1].points.map(point => point.x))
        if (minXOfBorder2 < minXOfBorder1) linearizedBorders.reverse()

        return linearizedBorders
    }

    getPointOnPath(anchor, t) {
        const bezierPoints = [
            anchor.position, 
            anchor.controlPoints[1], 
            anchor.nextAnchor.controlPoints[0], 
            anchor.nextAnchor.position
        ]

        // explicit form of cubic bezier curve
        return Shaper.Vector.exec(
            (p0, p1, p2, p3) => (1-t)**3 * p0 + 3 * (1-t)**2 * t * p1 + 3 * (1-t) * t**2 * p2 + t**3 * p3, 
            bezierPoints
        )
    }

    getPointsOnBorder(anchor, t) {
        const pointOnPath = this.getPointOnPath(anchor, t)
        const orthogonalVector = this.derivative(anchor, t).rotate(Math.PI/2).normalize()

        const width = this.getWidthOnPath(anchor, t)
        
        return [
            Shaper.Vector.add(pointOnPath, Shaper.Vector.mul(orthogonalVector, width/2)),
            Shaper.Vector.add(pointOnPath, Shaper.Vector.mul(orthogonalVector, -width/2))
        ]
    }

    getWidthOnPath(anchor, t) {
        return (Math.cos(Math.PI*t)+1)/2 * anchor.width 
            + (1 - (Math.cos(Math.PI*t)+1)/2) * anchor.nextAnchor.width
    }

    derivative(anchor, t) {
        const bezierPoints = [
            anchor.position, 
            anchor.controlPoints[1], 
            anchor.nextAnchor.controlPoints[0], 
            anchor.nextAnchor.position
        ]
        const bezierVectors = [
            Shaper.Vector.sub(bezierPoints[1], bezierPoints[0]),
            Shaper.Vector.sub(bezierPoints[2], bezierPoints[1]),
            Shaper.Vector.sub(bezierPoints[3], bezierPoints[2]),
        ]

        // explicit form of derivative of cubic bezier curve
        return Shaper.Vector.exec(
            (p0, p1, p2) => 3 * (1-t)**2 * p0 + 6 * (1-t) * t * p1 + 3 * t**2 * p2, 
            bezierVectors
        )
    }

    loopIndex(index) {
        return (index + this.anchors.length) % this.anchors.length
    }
}

export {Path}
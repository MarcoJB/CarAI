import { Vector2D } from "../Vector/Vector2D.js"

class Path {
    anchors

    constructor(anchors=null) {
        this.anchors = anchors || []
        this.calculateNeighborAnchors()
        this.calculataAnchorControlPoints()
    }

    addAnchor(anchor) {
        this.anchors.push(anchor)
        this.calculateNeighborAnchors()
        this.calculataAnchorControlPoints()
    }

    addAnchorAt(anchor, position) {
        this.anchors.splice(position, 0, anchor)
        this.calculateNeighborAnchors()
        this.calculataAnchorControlPoints()
    }

    addAnchorAfter(newAnchor, previousAnchor) {
        this.anchors.splice(this.anchors.indexOf(previousAnchor) + 1, 0, newAnchor)
        this.calculateNeighborAnchors()
        this.calculataAnchorControlPoints()
    }

    removeAnchor(anchor) {
        this.anchors.splice(this.anchors.indexOf(anchor), 1)
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

    getRasterizedPathSegment(anchor, resolution=10) {
        const rasterizationPoints = []

        for (let t = 0; t <= resolution; t++) {
            rasterizationPoints.push(this.getPointOnPath(anchor, t/resolution))
        }

        return rasterizationPoints
    }

    getPointOnPath(anchor, t) {
        return new Vector2D(
            (1-t)**3 * anchor.position.x 
            + 3 * (1-t)**2 * t * anchor.controlPoints[1].x 
            + 3 * (1-t) * t**2 * anchor.nextAnchor.controlPoints[0].x
            + t**3 * anchor.nextAnchor.position.x,
            (1-t)**3 * anchor.position.y 
            + 3 * (1-t)**2 * t * anchor.controlPoints[1].y 
            + 3 * (1-t) * t**2 * anchor.nextAnchor.controlPoints[0].y
            + t**3 * anchor.nextAnchor.position.y
        )
    }

    loopIndex(index) {
        return (index + this.anchors.length) % this.anchors.length
    }
}

export {Path}
class Path {
    anchors

    constructor(anchors=null) {
        this.anchors = anchors || []
        this.calculateNeighborAnchors()
    }

    addAnchor(anchor) {
        this.anchors.push(anchor)
        this.calculateNeighborAnchors()
    }

    addAnchorAt(anchor, position) {
        this.anchors.splice(position, 0, anchor)
        this.calculateNeighborAnchors()
    }

    addAnchorAfter(newAnchor, previousAnchor) {
        this.anchors.splice(this.anchors.indexOf(previousAnchor) + 1, 0, newAnchor)
        this.calculateNeighborAnchors()
    }

    removeAnchor(anchor) {
        this.anchors.splice(this.anchors.indexOf(anchor), 1)
        this.calculateNeighborAnchors()
    }

    calculateNeighborAnchors() {
        for (let i = 0; i < this.anchors.length; i++) {
            this.anchors[i].previousAnchor = this.anchors[this.loopIndex(i-1)]
            this.anchors[i].nextAnchor = this.anchors[this.loopIndex(i+1)]
        }
    }

    loopIndex(index) {
        return (index + this.anchors.length) % this.anchors.length
    }
}

export {Path}
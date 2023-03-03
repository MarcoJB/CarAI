class Shape {
    fillColor
    strokeColor
    strokeWidth
    zIndex

    constructor(config) {
        this.fillColor = config.fillColor || null
        this.strokeColor = config.strokeColor || null
        this.strokeWidth = config.strokeWidth || 0
        this.zIndex = config.zIndex || 0
    }

    setFillColor(fillColor) {
        this.fillColor = fillColor
    }

    setStrokeColor(strokeColor) {
        this.strokeColor = strokeColor
    }

    setStrokeWidth(strokeWidth) {
        this.strokeWidth = strokeWidth
    }

    setZIndex(zIndex) {
        this.zIndex = zIndex
    }

    move() {}

    contains() {
        return false
    }

    addToScene(scene) {
        scene.addShape(this)
        return this
    }

    render() {}
}

export {Shape}
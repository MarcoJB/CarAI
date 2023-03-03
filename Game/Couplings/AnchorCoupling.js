class AnchorCoupling {
    constructor(anchor=null, anchorShape=null, controlPoint1Shape=null, controlPoint2Shape=null, 
        controlPointLineShape1=null, controlPointLineShape2=null, trackShape1=null, trackShape2=null, 
        trackShape3=null) {
        this.anchor = anchor
        this.anchorShape = anchorShape
        this.controlPoint1Shape = controlPoint1Shape
        this.controlPoint2Shape = controlPoint2Shape
        this.controlPointLineShape1 = controlPointLineShape1
        this.controlPointLineShape2 = controlPointLineShape2
        this.trackShape1 = trackShape1
        this.trackShape2 = trackShape2
        this.trackShape3 = trackShape3
    }
}

export {AnchorCoupling}
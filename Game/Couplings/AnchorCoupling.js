class AnchorCoupling {
    constructor(anchor=null, anchorShape=null, controlPoint1Shape=null, controlPoint2Shape=null, 
        controlPointLineShape1=null, controlPointLineShape2=null, trackShape=null, linearizedTrackShapes, 
        linearizedBorderShapes1, linearizedBorderShapes2) {
        this.anchor = anchor
        this.anchorShape = anchorShape
        this.controlPoint1Shape = controlPoint1Shape
        this.controlPoint2Shape = controlPoint2Shape
        this.controlPointLineShape1 = controlPointLineShape1
        this.controlPointLineShape2 = controlPointLineShape2
        this.trackShape = trackShape
        this.linearizedTrackShapes = linearizedTrackShapes || []
        this.linearizedBorderShapes1 = linearizedBorderShapes1 || []
        this.linearizedBorderShapes2 = linearizedBorderShapes2 || []
    }
}

export {AnchorCoupling}
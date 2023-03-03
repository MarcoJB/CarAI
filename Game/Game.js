import { Circle } from "../Scene/Shapes/Circle.js"
import { Scene } from "../Scene/Scene.js"
import { Path } from "../Path/Path.js"
import { Line } from "../Scene/Shapes/Line.js"
import { BezierCurve } from "../Scene/Shapes/BezierCurve.js"
import { AnchorCoupling } from "./Couplings/AnchorCoupling.js"
import { Anchor } from "../Path/Anchor.js"

class Game {
    constructor(canvas) {
        this.scene = new Scene(canvas)
        this.path = new Path()
        this.anchorCouplings = []
        this.activeAnchorCoupling = null

        this.init()
    }

    init() {
        const startAnchors = [
            new Anchor(500, 150),
            new Anchor(700, 450),
            new Anchor(300, 450)
        ]

        startAnchors.forEach(anchor => this.path.addAnchor(anchor))
        startAnchors.forEach(anchor => this.addAnchorCoupling(anchor))

        this.scene.render()
    }

    addAnchorCoupling(anchor) {
        const controlPoints = anchor.controlPoints()
        const controlPointsNextAnchor = anchor.nextAnchor.controlPoints()

        const anchorCoupling = new AnchorCoupling()

        anchorCoupling.anchor = anchor

        // add anchor circle
        anchorCoupling.anchorShape = new Circle({
            x: anchor.position.x, 
            y: anchor.position.y, 
            radius: 10, 
            fillColor: "red", 
            zIndex: 22
        }).addToScene(this.scene)

        // add control point circles and lines
        anchorCoupling.controlPoint1Shape = new Circle({
            x: controlPoints[0].x, 
            y: controlPoints[0].y, 
            radius: 10, 
            fillColor: "grey", 
            zIndex: 21
        }).addToScene(this.scene)
        anchorCoupling.controlPoint2Shape = new Circle({
            x: controlPoints[1].x, 
            y: controlPoints[1].y, 
            radius: 10, 
            fillColor: "grey", 
            zIndex: 21
        }).addToScene(this.scene)
        anchorCoupling.controlPointLineShape1 = new Line({
            x1: anchor.position.x, 
            y1: anchor.position.y, 
            x2: controlPoints[0].x, 
            y2: controlPoints[0].y, 
            strokeColor: 'lightgrey', 
            strokeWidth: 1, 
            zIndex: 20
        }).addToScene(this.scene)
        anchorCoupling.controlPointLineShape2 = new Line({
            x1: anchor.position.x, 
            y1: anchor.position.y, 
            x2: controlPoints[1].x, 
            y2: controlPoints[1].y, 
            strokeColor: 'lightgrey', 
            strokeWidth: 1, 
            zIndex: 20
        }).addToScene(this.scene)

        // add track curves
        anchorCoupling.trackShape1 = new BezierCurve({
            x1: anchor.position.x, 
            y1: anchor.position.y, 
            x2: controlPoints[1].x, 
            y2: controlPoints[1].y,
            x3: controlPointsNextAnchor[0].x, 
            y3: controlPointsNextAnchor[0].y,
            x4: anchor.nextAnchor.position.x, 
            y4: anchor.nextAnchor.position.y,
            strokeColor: 'black', 
            strokeWidth: 50, 
            zIndex: 10
        }).addToScene(this.scene)

        anchorCoupling.trackShape2 = new BezierCurve({
            x1: anchor.position.x, 
            y1: anchor.position.y, 
            x2: controlPoints[1].x, 
            y2: controlPoints[1].y,
            x3: controlPointsNextAnchor[0].x, 
            y3: controlPointsNextAnchor[0].y,
            x4: anchor.nextAnchor.position.x, 
            y4: anchor.nextAnchor.position.y,
            strokeColor: 'white', 
            strokeWidth: 46, 
            zIndex: 11
        }).addToScene(this.scene)

        anchorCoupling.trackShape3 = new BezierCurve({
            x1: anchor.position.x, 
            y1: anchor.position.y, 
            x2: controlPoints[1].x, 
            y2: controlPoints[1].y,
            x3: controlPointsNextAnchor[0].x, 
            y3: controlPointsNextAnchor[0].y,
            x4: anchor.nextAnchor.position.x, 
            y4: anchor.nextAnchor.position.y,
            strokeColor: 'lightgrey', 
            strokeWidth: 1, 
            zIndex: 12
        }).addToScene(this.scene)

        this.anchorCouplings.push(anchorCoupling)
        
        // add click event listener to anchor circles
        this.scene.addEventListener("click", anchorCoupling.anchorShape, e => {
            this.activeAnchorCoupling?.anchorShape.setFillColor("red")
            anchorCoupling.anchorShape.setFillColor("lime")
            this.activeAnchorCoupling = anchorCoupling
            this.scene.render()
        }, {shiftKey: false})

        // add click event listener to track
        this.scene.addEventListener("click", anchorCoupling.trackShape1, e => {
            const newAnchor = new Anchor(e.offsetX, e.offsetY)
            this.path.addAnchorAfter(newAnchor, anchorCoupling.anchor)
            this.addAnchorCoupling(newAnchor)
            this.synchronize()
            this.scene.render()
        }, {shiftKey: true})

        // add right click event listener to anchor circles
        this.scene.addEventListener("contextmenu", anchorCoupling.anchorShape, e => {
            if (this.path.anchors.length > 3) {
                this.path.removeAnchor(anchorCoupling.anchor)

                this.scene.removeShape(anchorCoupling.anchorShape)
                this.scene.removeShape(anchorCoupling.controlPoint1Shape)
                this.scene.removeShape(anchorCoupling.controlPoint2Shape)
                this.scene.removeShape(anchorCoupling.controlPointLineShape1)
                this.scene.removeShape(anchorCoupling.controlPointLineShape2)
                this.scene.removeShape(anchorCoupling.trackShape1)
                this.scene.removeShape(anchorCoupling.trackShape2)
                this.scene.removeShape(anchorCoupling.trackShape3)
            }
        })
    }

    synchronize() {
        this.anchorCouplings.forEach(anchorCoupling => {
            const anchor = anchorCoupling.anchor

            const controlPoints = anchor.controlPoints()
            const controlPointsNextAnchor = anchor.nextAnchor.controlPoints()
            
            anchorCoupling.anchorShape.x = anchor.position.x
            anchorCoupling.anchorShape.y = anchor.position.y

            anchorCoupling.controlPoint1Shape.x = controlPoints[0].x
            anchorCoupling.controlPoint1Shape.y = controlPoints[0].y

            anchorCoupling.controlPoint2Shape.x = controlPoints[1].x
            anchorCoupling.controlPoint2Shape.y = controlPoints[1].y

            anchorCoupling.controlPointLineShape1.x1 = anchor.position.x
            anchorCoupling.controlPointLineShape1.y1 = anchor.position.y
            anchorCoupling.controlPointLineShape1.x2 = controlPoints[0].x
            anchorCoupling.controlPointLineShape1.y2 = controlPoints[0].y

            anchorCoupling.controlPointLineShape2.x1 = anchor.position.x
            anchorCoupling.controlPointLineShape2.y1 = anchor.position.y
            anchorCoupling.controlPointLineShape2.x2 = controlPoints[1].x
            anchorCoupling.controlPointLineShape2.y2 = controlPoints[1].y

            anchorCoupling.trackShape1.x1 = anchor.position.x
            anchorCoupling.trackShape1.y1 = anchor.position.y
            anchorCoupling.trackShape1.x2 = controlPoints[1].x
            anchorCoupling.trackShape1.y2 = controlPoints[1].y
            anchorCoupling.trackShape1.x3 = controlPointsNextAnchor[0].x
            anchorCoupling.trackShape1.y3 = controlPointsNextAnchor[0].y
            anchorCoupling.trackShape1.x4 = anchor.nextAnchor.position.x
            anchorCoupling.trackShape1.y4 = anchor.nextAnchor.position.y

            anchorCoupling.trackShape2.x1 = anchor.position.x
            anchorCoupling.trackShape2.y1 = anchor.position.y
            anchorCoupling.trackShape2.x2 = controlPoints[1].x
            anchorCoupling.trackShape2.y2 = controlPoints[1].y
            anchorCoupling.trackShape2.x3 = controlPointsNextAnchor[0].x
            anchorCoupling.trackShape2.y3 = controlPointsNextAnchor[0].y
            anchorCoupling.trackShape2.x4 = anchor.nextAnchor.position.x
            anchorCoupling.trackShape2.y4 = anchor.nextAnchor.position.y

            anchorCoupling.trackShape3.x1 = anchor.position.x
            anchorCoupling.trackShape3.y1 = anchor.position.y
            anchorCoupling.trackShape3.x2 = controlPoints[1].x
            anchorCoupling.trackShape3.y2 = controlPoints[1].y
            anchorCoupling.trackShape3.x3 = controlPointsNextAnchor[0].x
            anchorCoupling.trackShape3.y3 = controlPointsNextAnchor[0].y
            anchorCoupling.trackShape3.x4 = anchor.nextAnchor.position.x
            anchorCoupling.trackShape3.y4 = anchor.nextAnchor.position.y
        })
    }

    /*moveAnchor(anchor, vector) {
        const anchorCoupling = this.anchorCouplings.find(anchorCoupling => anchorCoupling.anchor == anchor)
    }*/
}

export {Game}
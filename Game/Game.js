import { Circle } from "../Scene/Shapes/Circle.js"
import { Scene } from "../Scene/Scene.js"
import { Path } from "../Path/Path.js"
import { Line } from "../Scene/Shapes/Line.js"
import { BezierCurve } from "../Scene/Shapes/BezierCurve.js"
import { AnchorCoupling } from "./Couplings/AnchorCoupling.js"
import { Anchor } from "../Path/Anchor.js"
import { StateManager } from "./StateManager.js"
import { Vector2D } from "../Vector/Vector2D.js"

class Game {
    constructor(canvas) {
        this.scene = new Scene(canvas)
        this.path = new Path()
        this.anchorCouplings = []
        this.activeAnchorCoupling = null
        this.stateManager = StateManager
        StateManager.setPath(this.path);
        this.linearizationResolution = 20
        this.showControlPoints = false

        this.init(StateManager.currentAnchors)
    }

    init(anchors) {
        this.path.anchors = anchors
        this.path.update()

        anchors.forEach(anchor => this.addAnchorCoupling(anchor))
        this.setActiveAnchorCoupling(this.anchorCouplings[0])

        this.scene.render()
    }

    redraw() {
        this.scene.reset()

        this.anchorCouplings = []
        this.path.anchors.forEach(anchor => this.addAnchorCoupling(anchor))
        this.setActiveAnchorCoupling(this.anchorCouplings[0])

        this.scene.render()
    }

    addAnchorCoupling(anchor) {
        const anchorCoupling = new AnchorCoupling()

        anchorCoupling.anchor = anchor

        // add anchor circle
        anchorCoupling.anchorShape = new Circle({
            radius: 10,
            fillColor: "red",
            zIndex: 22
        }).addToScene(this.scene)

        // add control point circles and lines
        if (this.showControlPoints) {
            anchorCoupling.controlPoint1Shape = new Circle({
                radius: 10,
                fillColor: "grey",
                zIndex: 21
            }).addToScene(this.scene)
            anchorCoupling.controlPoint2Shape = new Circle({
                radius: 10,
                fillColor: "grey",
                zIndex: 21
            }).addToScene(this.scene)
            anchorCoupling.controlPointLineShape1 = new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 20
            }).addToScene(this.scene)
            anchorCoupling.controlPointLineShape2 = new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 20
            }).addToScene(this.scene)
        }

        // add track curves (only for click events)
        anchorCoupling.trackShape = new BezierCurve({
            strokeColor: 'white',
            strokeWidth: 50,
            zIndex: 10
        }).addToScene(this.scene)

        // add linearized track curve
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.linearizedTrackShapes.push(new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 15
            }).addToScene(this.scene))
        }

        // add linearized track curve borders
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.linearizedBorderShapes1.push(new Line({
                strokeColor: 'black',
                strokeWidth: 2,
                zIndex: 15
            }).addToScene(this.scene))
        }
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.linearizedBorderShapes2.push(new Line({
                strokeColor: 'black',
                strokeWidth: 2,
                zIndex: 15
            }).addToScene(this.scene))
        }

        this.anchorCouplings.push(anchorCoupling)


        // add click event listener to anchor circles
        this.scene.addEventListener("mousedown", anchorCoupling.anchorShape, e => {
            this.setActiveAnchorCoupling(anchorCoupling)
        }, { shiftKey: false, button: 0 })

        // add click event listener to track
        this.scene.addEventListener("mousedown", anchorCoupling.trackShape, e => {
            const newAnchor = new Anchor(e.offsetX, e.offsetY)
            this.path.addAnchorAfter(newAnchor, anchorCoupling.anchor)
            this.addAnchorCoupling(newAnchor)
            this.setActiveAnchorCoupling(this.anchorCouplings.at(-1))
            this.synchronize()
            this.scene.render()
        }, { shiftKey: true, button: 0 })

        // add right click event listener to anchor circles
        this.scene.addEventListener("mousedown", anchorCoupling.anchorShape, e => {
            if (this.path.anchors.length > 3) {
                this.path.removeAnchor(anchorCoupling.anchor)

                this.scene.removeShape(anchorCoupling.anchorShape)
                this.scene.removeShape(anchorCoupling.controlPoint1Shape)
                this.scene.removeShape(anchorCoupling.controlPoint2Shape)
                this.scene.removeShape(anchorCoupling.controlPointLineShape1)
                this.scene.removeShape(anchorCoupling.controlPointLineShape2)
                this.scene.removeShape(anchorCoupling.trackShape)
                anchorCoupling.linearizedTrackShapes.forEach(linearizedTrackShape => this.scene.removeShape(linearizedTrackShape))
                anchorCoupling.linearizedBorderShapes1.forEach(linearizedBorderShape => this.scene.removeShape(linearizedBorderShape))
                anchorCoupling.linearizedBorderShapes2.forEach(linearizedBorderShape => this.scene.removeShape(linearizedBorderShape))

                this.synchronize()
                this.scene.render()
            }
        }, { button: 2 })

        this.scene.addEventListener("drag", anchorCoupling.anchorShape, (e, offset) => {
            anchorCoupling.anchor.position = Vector2D.add(anchorCoupling.anchor.position, offset)
            this.path.calculataAnchorControlPoints()
            this.synchronize()
            this.scene.render()
        })

        this.synchronize()
    }

    synchronize() {
        this.anchorCouplings.forEach(anchorCoupling => {
            const anchor = anchorCoupling.anchor

            const controlPoints = anchor.controlPoints
            const controlPointsNextAnchor = anchor.nextAnchor.controlPoints
            const linearizedPath = this.path.getLinearizedPath(anchor, this.linearizationResolution)
            const linearizedBorders = this.path.getLinearizedBorders(anchor, this.linearizationResolution)

            anchorCoupling.anchorShape.x = anchor.position.x
            anchorCoupling.anchorShape.y = anchor.position.y

            if (this.showControlPoints) {
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
            }

            anchorCoupling.trackShape.x1 = anchor.position.x
            anchorCoupling.trackShape.y1 = anchor.position.y
            anchorCoupling.trackShape.x2 = controlPoints[1].x
            anchorCoupling.trackShape.y2 = controlPoints[1].y
            anchorCoupling.trackShape.x3 = controlPointsNextAnchor[0].x
            anchorCoupling.trackShape.y3 = controlPointsNextAnchor[0].y
            anchorCoupling.trackShape.x4 = anchor.nextAnchor.position.x
            anchorCoupling.trackShape.y4 = anchor.nextAnchor.position.y
            
            for (let i = 0; i < linearizedPath.length - 1; i++) {
                anchorCoupling.linearizedTrackShapes[i].x1 = linearizedPath[i].x
                anchorCoupling.linearizedTrackShapes[i].y1 = linearizedPath[i].y
                anchorCoupling.linearizedTrackShapes[i].x2 = linearizedPath[i+1].x
                anchorCoupling.linearizedTrackShapes[i].y2 = linearizedPath[i+1].y
            }
            
            for (let i = 0; i < linearizedBorders.length - 1; i++) {
                anchorCoupling.linearizedBorderShapes1[i].x1 = linearizedBorders[i][0].x
                anchorCoupling.linearizedBorderShapes1[i].y1 = linearizedBorders[i][0].y
                anchorCoupling.linearizedBorderShapes1[i].x2 = linearizedBorders[i+1][0].x
                anchorCoupling.linearizedBorderShapes1[i].y2 = linearizedBorders[i+1][0].y
            }
            
            for (let i = 0; i < linearizedBorders.length - 1; i++) {
                anchorCoupling.linearizedBorderShapes2[i].x1 = linearizedBorders[i][1].x
                anchorCoupling.linearizedBorderShapes2[i].y1 = linearizedBorders[i][1].y
                anchorCoupling.linearizedBorderShapes2[i].x2 = linearizedBorders[i+1][1].x
                anchorCoupling.linearizedBorderShapes2[i].y2 = linearizedBorders[i+1][1].y
            }
        })
    }

    update() {
        this.synchronize()
        this.scene.render()
    }

    setActiveAnchorCoupling(anchorCoupling) {
        this.activeAnchorCoupling?.anchorShape.setFillColor("red")
        anchorCoupling.anchorShape.setFillColor("lime")
        this.activeAnchorCoupling = anchorCoupling

        document.getElementById("trackWidth").value = this.activeAnchorCoupling.anchor.width

        this.scene.render()
    }
}

export { Game }
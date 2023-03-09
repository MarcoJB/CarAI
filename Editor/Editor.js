import { Circle } from "../Scene/Shapes/Circle.js"
import { Path } from "../Path/Path.js"
import { Line } from "../Scene/Shapes/Line.js"
import { Container } from "../Scene/Shapes/Container.js"
import { BezierCurve } from "../Scene/Shapes/BezierCurve.js"
import { AnchorCoupling } from "./Couplings/AnchorCoupling.js"
import { Anchor } from "../Path/Anchor.js"
import { StateManager } from "../Game/StateManager.js"
import { Shaper } from "../Shaper.js"

class Editor {
    constructor(scene) {
        this.scene = scene
        this.stateManager = StateManager
        StateManager.setPath(this.path)
        this.car = null
        this.step = 0.02
        
        this.path = new Path()
        this.anchorCouplings = []
        this.activeAnchorCoupling = null
        this.linearizationResolution = 10
        this.showControlPoints = false

        this.startMarker = new Container({zIndex: 30})
        this.scene.rootShape.addChildShape(this.startMarker)
        this.startMarker.addChildShape(new Line({
            points: [new Shaper.Vector(0, 0), new Shaper.Vector(30, 0)],
            strokeColor: "black",
            strokeWidth: 2
        }))
        this.startMarker.addChildShape(new Line({
            points: [new Shaper.Vector(22, 7), new Shaper.Vector(30, 0)],
            strokeColor: "black",
            strokeWidth: 2
        }))
        this.startMarker.addChildShape(new Line({
            points: [new Shaper.Vector(22, -7), new Shaper.Vector(30, 0)],
            strokeColor: "black",
            strokeWidth: 2
        }))

        this.path.anchors = StateManager.currentAnchors
        this.path.update()

        this.init()
    }

    init() {

        this.path.anchors.forEach(anchor => this.addAnchorCoupling(anchor))
        this.setActiveAnchorCoupling(this.anchorCouplings[0])

        //this.redraw()
    }

    redraw() {
        this.scene.reset()
        this.scene.rootShape.addChildShape(this.startMarker)

        this.anchorCouplings = []
        this.path.anchors.forEach(anchor => this.addAnchorCoupling(anchor))
        this.setActiveAnchorCoupling(this.anchorCouplings[0])

        this.scene.render()
    }

    addAnchorCoupling(anchor) {
        const anchorCoupling = new AnchorCoupling(anchor)

        // add anchor circle
        anchorCoupling.shapes.anchor = new Circle({
            radius: 10,
            fillColor: "red",
            zIndex: 22
        }).addToScene(this.scene)

        // add control point circles and lines
        if (this.showControlPoints) {
            anchorCoupling.shapes.controlPoints[0] = new Circle({
                radius: 10,
                fillColor: "grey",
                zIndex: 21
            }).addToScene(this.scene)
            anchorCoupling.shapes.controlPoints[1] = new Circle({
                radius: 10,
                fillColor: "grey",
                zIndex: 21
            }).addToScene(this.scene)
            anchorCoupling.shapes.controlPointLines[0] = new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 20
            }).addToScene(this.scene)
            anchorCoupling.shapes.controlPointLines[1] = new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 20
            }).addToScene(this.scene)
        }

        // add track curves (only for click events)
        anchorCoupling.shapestrackBezier = new BezierCurve({
            strokeColor: 'whitesmoke',
            strokeWidth: 20,
            zIndex: 10
        }).addToScene(this.scene)

        // add linearized track curve
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.shapes.trackMiddleLine.push(new Line({
                strokeColor: 'lightgrey',
                strokeWidth: 1,
                zIndex: 15
            }).addToScene(this.scene))
        }

        // add linearized track curve borders
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.shapes.trackBorders[0].push(new Line({
                strokeColor: 'black',
                strokeWidth: 2,
                zIndex: 15
            }).addToScene(this.scene))
        }
        for (let i = 0; i < this.linearizationResolution; i++) {
            anchorCoupling.shapes.trackBorders[1].push(new Line({
                strokeColor: 'black',
                strokeWidth: 2,
                zIndex: 15
            }).addToScene(this.scene))
        }

        this.anchorCouplings.push(anchorCoupling)


        // add click event listener to anchor circles
        this.scene.addEventListener("mousedown", anchorCoupling.shapes.anchor, e => {
            this.setActiveAnchorCoupling(anchorCoupling)
        }, { shiftKey: false, button: 0 })

        // add click event listener to track
        this.scene.addEventListener("mousedown", anchorCoupling.shapestrackBezier, e => {
            const newAnchor = new Anchor(e.offsetX, e.offsetY)
            this.path.addAnchorAfter(newAnchor, anchorCoupling.anchor)
            this.addAnchorCoupling(newAnchor)
            this.setActiveAnchorCoupling(this.anchorCouplings.at(-1))
            this.synchronize()
            this.scene.render()
        }, { shiftKey: true, button: 0 })

        // add right click event listener to anchor circles
        this.scene.addEventListener("mousedown", anchorCoupling.shapes.anchor, e => {
            if (this.path.anchors.length > 3) {
                this.path.removeAnchor(anchorCoupling.anchor)

                this.scene.removeShape(anchorCoupling.shapes.anchor)
                if (this.showControlPoints) {
                    this.scene.removeShape(anchorCoupling.shapes.controlPoints[0])
                    this.scene.removeShape(anchorCoupling.shapes.controlPoints[1])
                    this.scene.removeShape(anchorCoupling.shapes.controlPointLines[0])
                    this.scene.removeShape(anchorCoupling.shapes.controlPointLines[1])
                }
                this.scene.removeShape(anchorCoupling.shapestrackBezier)
                anchorCoupling.shapes.trackMiddleLine.forEach(linearizedTrackShape => this.scene.removeShape(linearizedTrackShape))
                anchorCoupling.shapes.trackBorders[0].forEach(linearizedBorderShape => this.scene.removeShape(linearizedBorderShape))
                anchorCoupling.shapes.trackBorders[1].forEach(linearizedBorderShape => this.scene.removeShape(linearizedBorderShape))

                this.removeAnchorCoupling(anchorCoupling)

                this.synchronize()
                this.scene.render()
            }
        }, { button: 2 })

        this.scene.addEventListener("drag", anchorCoupling.shapes.anchor, (e, offset) => {
            anchorCoupling.anchor.position = Shaper.Vector.add(anchorCoupling.anchor.position, offset)
            this.path.calculataAnchorControlPoints()
            this.synchronize()
            this.scene.render()
        })

        this.synchronize()
    }

    removeAnchorCoupling(anchorCoupling) {
        this.anchorCouplings.splice(this.anchorCouplings.indexOf(anchorCoupling), 1)
    }

    synchronize() {
        this.anchorCouplings.forEach(anchorCoupling => {
            const anchor = anchorCoupling.anchor

            const controlPoints = anchor.controlPoints
            const controlPointsNextAnchor = anchor.nextAnchor.controlPoints
            const linearizedPath = this.path.getLinearizedPath(anchor, this.linearizationResolution)
            const linearizedBorders = this.path.getLinearizedSegmentBorders(anchor, this.linearizationResolution)

            anchorCoupling.shapes.anchor.center = anchor.position

            if (this.showControlPoints) {
                anchorCoupling.shapes.controlPoints[0].center = controlPoints[0]
                anchorCoupling.shapes.controlPoints[1].center = controlPoints[1]
                anchorCoupling.shapes.controlPointLines[0].points = [anchor.position, controlPoints[0]]
                anchorCoupling.shapes.controlPointLines[1].points = [anchor.position, controlPoints[1]]
            }

            anchorCoupling.shapestrackBezier.points = [
                anchor.position,
                controlPoints[1],
                controlPointsNextAnchor[0],
                anchor.nextAnchor.position,
            ]
            
            for (let i = 0; i < linearizedPath.length - 1; i++) {
                anchorCoupling.shapes.trackMiddleLine[i].points = [linearizedPath[i], linearizedPath[i+1]]
            }
            
            for (let i = 0; i < linearizedBorders[0].points.length - 1; i++) {
                anchorCoupling.shapes.trackBorders[0][i].points = [
                    linearizedBorders[0].points[i], 
                    linearizedBorders[0].points[i+1],
                ]
            }
            
            for (let i = 0; i < linearizedBorders[1].points.length - 1; i++) {
                anchorCoupling.shapes.trackBorders[1][i].points = [
                    linearizedBorders[1].points[i], 
                    linearizedBorders[1].points[i+1],
                ]
            }
        })

        this.startMarker.position = this.path.anchors[0].position
        const derivative = this.path.derivative(this.path.anchors[0], 0)
        this.startMarker.rotation = -Math.atan2(derivative.y, derivative.x)
    }

    update() {
        this.synchronize()
        this.scene.render()
    }

    setActiveAnchorCoupling(anchorCoupling) {
        this.activeAnchorCoupling?.shapes.anchor.setFillColor("red")
        anchorCoupling.shapes.anchor.setFillColor("lime")
        this.activeAnchorCoupling = anchorCoupling

        document.getElementById("trackWidth").value = this.activeAnchorCoupling.anchor.width

        this.scene.render()
    }

    getBorders() {
        return this.path.getLinearizedBorders(this.linearizationResolution)
    }
}

export { Editor }
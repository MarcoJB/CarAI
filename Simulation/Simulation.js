import { Polygon } from "../Scene/Shapes/Polygon.js"
import { Container } from "../Scene/Shapes/Container.js"
import { Circle } from "../Scene/Shapes/Circle.js"
import { Rect } from "../Scene/Shapes/Rect.js"
import { Clock } from "./Clock.js"
import { Car } from "./Car.js"
import { Shaper } from "./../Shaper.js"
import { Line } from "../Scene/Shapes/Line.js"

class Simulation {
    constructor(trackBorders, scene=null) {
        this.trackBorders = trackBorders
        this.scene = scene
        this.step = 0.02

        this.car = new Car()
        this.car.position = Shaper.Vector.add(trackBorders[0].points[0], trackBorders[1].points[0]).div(2)
        const derivative = Shaper.Vector.sub(trackBorders[0].points[0], trackBorders[1].points[0])
            .rotate(Math.PI / 2)
        this.car.rotation = -Math.atan2(derivative.y, derivative.x)
        this.car.shape = new Container({zIndex: 50})
        this.scene.rootShape.addChildShape(this.car.shape)
        this.car.shape.addChildShape(new Circle({
            center: new Shaper.Vector(-5, 0),
            radius: 5,
            fillColor: "black",
            zIndex: 20,
        }))
        const carFront = new Circle({
            center: new Shaper.Vector(5, 0),
            radius: 5,
            fillColor: "green",
            zIndex: 20,
        })
        this.car.shape.addChildShape(carFront)
        this.car.shape.addChildShape(new Rect({
            points: [
                new Shaper.Vector(-5, -5),
                new Shaper.Vector(5, -5),
                new Shaper.Vector(5, 5),
                new Shaper.Vector(-5, 5),
            ],
            fillColor: "black",
            zIndex: 20,
        }))
        const ray1 = new Line({
            points: [new Shaper.Vector(5, 0), new Shaper.Vector(5, 55)],
            strokeColor: "darkgrey",
            strokeWidth: 1,
            zIndex: 10,
        })
        const ray2 = new Line({
            points: [new Shaper.Vector(5, 0), new Shaper.Vector(43.89, 38.89)],
            strokeColor: "darkgrey",
            strokeWidth: 1,
            zIndex: 10,
        })
        const ray3 = new Line({
            points: [new Shaper.Vector(5, 0), new Shaper.Vector(60, 0)],
            strokeColor: "darkgrey",
            strokeWidth: 1,
            zIndex: 10,
        })
        const ray4 = new Line({
            points: [new Shaper.Vector(5, 0), new Shaper.Vector(43.89, -38.89)],
            strokeColor: "darkgrey",
            strokeWidth: 1,
            zIndex: 10,
        })
        const ray5 = new Line({
            points: [new Shaper.Vector(5, 0), new Shaper.Vector(5, -55)],
            strokeColor: "darkgrey",
            strokeWidth: 1,
            zIndex: 10,
        })
        this.car.shape.addChildShape(ray1)
        this.car.shape.addChildShape(ray2)
        this.car.shape.addChildShape(ray3)
        this.car.shape.addChildShape(ray4)
        this.car.shape.addChildShape(ray5)

        Clock.step = this.step
        Clock.addEventListener("tick", () => {
            this.car.step(this.step)

            const distanceToTrackBorders = this.car.calcDistanceToTrackBorders(this.trackBorders)

            if (distanceToTrackBorders !== false) {
                carFront.fillColor = "green"
                ray1.points[1] = ray1.points[0].add(new Shaper.Vector(0, 1).mul(distanceToTrackBorders[0]+5))
                ray2.points[1] = ray2.points[0].add(new Shaper.Vector(0.707, 0.707).mul(distanceToTrackBorders[1]+5))
                ray3.points[1] = ray3.points[0].add(new Shaper.Vector(1, 0).mul(distanceToTrackBorders[2]+5))
                ray4.points[1] = ray4.points[0].add(new Shaper.Vector(0.707, -0.707).mul(distanceToTrackBorders[3]+5))
                ray5.points[1] = ray5.points[0].add(new Shaper.Vector(0, -1).mul(distanceToTrackBorders[4]+5))
            } else {
                carFront.fillColor = "#a00"
                ray1.points[1] = ray1.points[0]
                ray2.points[1] = ray2.points[0]
                ray3.points[1] = ray3.points[0]
                ray4.points[1] = ray4.points[0]
                ray5.points[1] = ray5.points[0]
            }

            this.update()
        })
        Clock.start()

        window.addEventListener("keydown", e => {
            switch(e.key) {
                case "ArrowUp":
                    this.car.acceleration = 500
                    break
                case "ArrowDown":
                    this.car.acceleration = -500
                    break
                case "ArrowRight":
                    this.car.angularVelocity = -Math.PI
                    break
                case "ArrowLeft":
                    this.car.angularVelocity = Math.PI
                    break
            }
        })
        window.addEventListener("keyup", e => {
            switch(e.key) {
                case "ArrowUp":
                    this.car.acceleration = 0
                    break
                case "ArrowDown":
                    this.car.acceleration = 0
                    break
                case "ArrowRight":
                    this.car.angularVelocity = 0
                    break
                case "ArrowLeft":
                    this.car.angularVelocity = 0
                    break
            }
        })

        if (scene) {
            this.initRendering()
            this.update()
        }
    }

    initRendering() {
        if (!this.scene) return

        this.scene.addShape(new Polygon({
            strokeColor: "black",
            strokeWidth: 1,
            fillColor: "#f8f8f8",
            points: this.trackBorders[0].points,
            holes: [this.trackBorders[1].points.slice(0).reverse()],
        }))
    }

    update() {
        this.synchronize()
        this.render()
    }

    synchronize() {
        this.car.shape.position = this.car.position
        this.car.shape.rotation = this.car.rotation
    }

    render() {
        if (!this.scene) return

        this.scene.render()
    }
}

export {Simulation}
import { Polygon } from "../Scene/Shapes/Polygon.js"
import { Container } from "../Scene/Shapes/Container.js"
import { Circle } from "../Scene/Shapes/Circle.js"
import { Rect } from "../Scene/Shapes/Rect.js"
import { Clock } from "./Clock.js"
import { Car } from "./Car.js"
import { Shaper } from "./../Shaper.js"
import { Line } from "../Scene/Shapes/Line.js"
import { Layer } from "../ANN/Layer.js"
import { ANN } from "../ANN/ANN.js"

class Simulation {
    constructor(trackBorders, scene=null) {
        this.numberOfCars = 300
        this.cars = []

        this.trackBorders = trackBorders
        this.scene = scene
        this.stepDuration = 0.03
        this.generationDuration = 5
        this.generation = 1

        this.highscores = [0]
        this.averages = [0]
        this.averagesTops = [0]

        this.initCars()

        Clock.step = this.stepDuration
        Clock.addEventListener("tick", () => {
            this.step()
        })
        Clock.addEventListener("finish", () => {
            this.nextGeneration()
        })

        /*window.addEventListener("keydown", e => {
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
        })*/

        if (scene) {
            this.initRendering()
            this.update()
        }
    }

    initCars() {
        for (let i = 0; i < this.numberOfCars; i++) {
            const car = new Car()

            car.trackBorders = this.trackBorders

            car.position = Shaper.Vector.add(this.trackBorders[0].points[0], this.trackBorders[1].points[0]).div(2)
            const derivative = Shaper.Vector.sub(this.trackBorders[0].points[0], this.trackBorders[1].points[0])
                .rotate(Math.PI / 2)
            car.rotation = -Math.atan2(derivative.y, derivative.x)

            car.calcDistanceToTrackBorders()

            car.shape = new Container({zIndex: 50})
            this.scene.rootShape.addChildShape(car.shape)
            car.shape.addChildShape(new Circle({
                center: new Shaper.Vector(-5, 0),
                radius: 5,
                fillColor: "black",
                zIndex: 20,
            }))
            car.front = new Circle({
                center: new Shaper.Vector(5, 0),
                radius: 5,
                fillColor: "green",
                zIndex: 20,
            })
            car.shape.addChildShape(car.front)
            car.shape.addChildShape(new Rect({
                points: [
                    new Shaper.Vector(-5, -5),
                    new Shaper.Vector(5, -5),
                    new Shaper.Vector(5, 5),
                    new Shaper.Vector(-5, 5),
                ],
                fillColor: "black",
                zIndex: 20,
            }))
            car.rays.push(new Line({
                points: [new Shaper.Vector(5, 0), new Shaper.Vector(5, 55)],
                strokeColor: "#0f03",
                strokeWidth: 1,
                zIndex: 10,
            }))
            car.rays.push(new Line({
                points: [new Shaper.Vector(5, 0), new Shaper.Vector(43.89, 38.89)],
                strokeColor: "#0f03",
                strokeWidth: 1,
                zIndex: 10,
            }))
            car.rays.push(new Line({
                points: [new Shaper.Vector(5, 0), new Shaper.Vector(60, 0)],
                strokeColor: "#0f03",
                strokeWidth: 1,
                zIndex: 10,
            }))
            car.rays.push(new Line({
                points: [new Shaper.Vector(5, 0), new Shaper.Vector(43.89, -38.89)],
                strokeColor: "#0f03",
                strokeWidth: 1,
                zIndex: 10,
            }))
            car.rays.push(new Line({
                points: [new Shaper.Vector(5, 0), new Shaper.Vector(5, -55)],
                strokeColor: "#0f03",
                strokeWidth: 1,
                zIndex: 10,
            }))
            car.shape.addChildShape(car.rays[0])
            car.shape.addChildShape(car.rays[1])
            car.shape.addChildShape(car.rays[2])
            car.shape.addChildShape(car.rays[3])
            car.shape.addChildShape(car.rays[4])

            car.ann = new ANN()
            car.ann.addLayer(new Layer(5, ANN.ActivationFunctions.Tanh, 6))
            car.ann.addLayer(new Layer(4, ANN.ActivationFunctions.Tanh))
            car.ann.addLayer(new Layer(3, ANN.ActivationFunctions.Tanh))
            car.ann.addLayer(new Layer(2, ANN.ActivationFunctions.Tanh))
            car.ann.initWeights()

            this.cars.push(car)
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

    start() {
        Clock.start(this.generation)
        console.log("Generation 1 started") 
    }

    nextGeneration() {
        this.generation++

        Clock.stop()

        this.cars.forEach(car => car.calcScore())
        this.cars.sort((car1, car2) => car2.score - car1.score)

        this.highscores.push(this.cars[0].score)
        this.averages.push(this.cars.reduce((score, car) => score + car.score, 0) / this.numberOfCars)
        this.averagesTops.push(this.cars.slice(0, Math.floor(this.cars.length/3)).reduce((score, car) => score 
            + car.score, 0) / Math.floor(this.cars.length/3))

        


        this.drawScoreShart()
        this.drawAnnChart()


        for (let i = 0; i < Math.floor(this.cars.length/3); i++) {
            const mutateCar = this.cars[i + Math.floor(this.cars.length/3)]
            mutateCar.ann = this.cars[i].ann.clone()
            mutateCar.ann.mutate(0.1)

            const mutateCar2 = this.cars[i + 2*Math.floor(this.cars.length/3)]
            mutateCar2.ann = this.cars[i].ann.clone()
            mutateCar2.ann.mutate(0.02)
        }

        const startPosition = Shaper.Vector.add(this.trackBorders[0].points[0], this.trackBorders[1].points[0]).div(2)
        const derivative = Shaper.Vector.sub(this.trackBorders[0].points[0], this.trackBorders[1].points[0])
                .rotate(Math.PI / 2)
        const startRotation = -Math.atan2(derivative.y, derivative.x)

        this.cars.forEach(car => {
            car.reset()
            car.position = startPosition
            car.rotation = startRotation
            car.calcDistanceToTrackBorders()
        })
        
        Clock.start(this.generation)

        console.log("Generation", this.generation, "started")
    }

    drawScoreShart() {
        const scoreContext = document.querySelector("#scorecanvas").getContext("2d")
        scoreContext.clearRect(0, 0, 400, 250)

        const maxValue = Math.max(...this.highscores)

        scoreContext.beginPath()
        scoreContext.moveTo(0, 250)
        for (let i = 1; i < this.generation; i++) {
            scoreContext.lineTo(i/(this.generation-1)*400, (1-this.highscores[i]/maxValue)*250)
        }
        scoreContext.strokeStyle = "#a00"
        scoreContext.stroke()
        scoreContext.closePath()

        scoreContext.beginPath()
        scoreContext.moveTo(0, 250)
        for (let i = 1; i < this.generation; i++) {
            scoreContext.lineTo(i/(this.generation-1)*400, (1-this.averagesTops[i]/maxValue)*250)
        }
        scoreContext.strokeStyle = "#0a0"
        scoreContext.stroke()
        scoreContext.closePath()

        scoreContext.beginPath()
        scoreContext.moveTo(0, 250)
        for (let i = 1; i < this.generation; i++) {
            scoreContext.lineTo(i/(this.generation-1)*400, (1-this.averages[i]/maxValue)*250)
        }
        scoreContext.strokeStyle = "#00a"
        scoreContext.stroke()
        scoreContext.closePath()
    }

    drawAnnChart() {
        const annContext = document.querySelector("#anncanvas").getContext("2d")
        annContext.clearRect(0, 0, 400, 250)

        const bestAnn = this.cars[0].ann
        let bestAnnActivations = null
        if (this.cars[0].distanceToTrackBorders !== false) {
            bestAnnActivations = this.cars[0].getBrainDecisions()
        }
        const neuronPositions = []
        const weights = bestAnn.layers.map(layer => layer.neurons.map(neuron => neuron.weights))
        weights.unshift(Array(bestAnn.layers[0].neurons[0].inputSize).fill([]))

        const maxNeuronsPerLayer = Math.max(
            bestAnn.layers[0].neurons[0].inputSize,
            ...bestAnn.layers.map(layer => layer.neurons.length)
            )
        weights.forEach((layer, layerIndex) => {
            neuronPositions[layerIndex] = []
            layer.forEach((neuron, neuronIndex) => {
                neuronPositions[layerIndex][neuronIndex] = new Shaper.Vector(
                    (layerIndex + 0.5) / weights.length * 400,
                    (neuronIndex + 0.5 + (maxNeuronsPerLayer - layer.length) / 2) 
                        / maxNeuronsPerLayer * 250,
                )
            })
        })
        neuronPositions.forEach((neuronPositionsLayer, layerIndex) => {
            neuronPositionsLayer.forEach((neuronPosition, neuronIndex) => {
                neuronPositions[layerIndex + 1]?.forEach((nextNeuronPosition, nextNeuronIndex) => {
                    const weight = weights[layerIndex+1][nextNeuronIndex][neuronIndex]

                    annContext.beginPath()
                    annContext.moveTo(neuronPosition.x, neuronPosition.y)
                    annContext.lineTo(nextNeuronPosition.x, nextNeuronPosition.y)
                    annContext.strokeStyle = weight > 0 ? "#0f0" : "#f00"
                    annContext.lineWidth = 2 * Math.abs(weight)
                    annContext.stroke()
                    annContext.closePath()
                })
                
                annContext.beginPath()
                annContext.arc(neuronPosition.x, neuronPosition.y, 10, 0, 2 * Math.PI)
                if (bestAnnActivations !== null) {
                    const activation = bestAnnActivations[layerIndex][neuronIndex]
                    if (activation > 0) {
                        annContext.fillStyle = "rgb(" + (1-activation/2)*255 + ", 255, " + (1-activation/2)*255 + ")"
                    } else {
                        annContext.fillStyle = "rgb(255, " + (1+activation/2)*255 + ", " + (1+activation/2)*255 + ")"
                    }
                } else {
                    annContext.fillStyle = "white"
                }
                annContext.fill()
                annContext.strokeStyle = "black"
                annContext.lineWidth = 1
                annContext.stroke()
                annContext.closePath()
            })
        })
    }

    step() {
        this.cars.forEach(car => {
            const distanceToTrackBorders = car.step(this.stepDuration)
    
            if (distanceToTrackBorders !== false) {
                car.front.fillColor = "green"
                car.rays[0].points[1] = car.rays[0].points[0].add(new Shaper.Vector(0, 1).mul(distanceToTrackBorders[0]+5))
                car.rays[1].points[1] = car.rays[1].points[0].add(new Shaper.Vector(0.707, 0.707).mul(distanceToTrackBorders[1]+5))
                car.rays[2].points[1] = car.rays[2].points[0].add(new Shaper.Vector(1, 0).mul(distanceToTrackBorders[2]+5))
                car.rays[3].points[1] = car.rays[3].points[0].add(new Shaper.Vector(0.707, -0.707).mul(distanceToTrackBorders[3]+5))
                car.rays[4].points[1] = car.rays[4].points[0].add(new Shaper.Vector(0, -1).mul(distanceToTrackBorders[4]+5))
            } else {
                car.front.fillColor = "#a00"
                car.rays[0].points[1] = car.rays[0].points[0]
                car.rays[1].points[1] = car.rays[1].points[0]
                car.rays[2].points[1] = car.rays[2].points[0]
                car.rays[3].points[1] = car.rays[3].points[0]
                car.rays[4].points[1] = car.rays[4].points[0]
            }
        })


        if (this.cars[0].distanceToTrackBorders !== false) this.drawAnnChart()
        

        this.update()
    }

    update() {
        this.synchronize()
        this.render()
    }

    synchronize() {
        this.cars.forEach(car => {
            car.shape.position = car.position
            car.shape.rotation = car.rotation
        })
    }

    render() {
        if (!this.scene) return

        this.scene.render()
    }
}

export {Simulation}
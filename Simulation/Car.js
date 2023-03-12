import { Shaper } from "../Shaper.js"
import { Clock } from "./Clock.js"

class Car {
    constructor() {
        this.shape = null
        this.front = null
        this.rays = []
        this.trackShape = null

        this.ann = null

        this.reset()
    }

    reset() {
        this.position = Shaper.Vector.zero()
        this.speed = 0
        this.acceleration = 0

        this.rotation = 0
        this.angularVelocity = 0

        this.distanceToTrackBorders = false
        this.rounds = 0
        this.score = null
        
        this.startLineDistance = null
    }

    step(t=0.1) {
        if (this.distanceToTrackBorders === false) return false

        const brainDecisions = this.getBrainDecisions().at(-1)
        this.acceleration = brainDecisions[0] * 500
        this.angularVelocity = brainDecisions[1] * Math.PI

        const velocity = Shaper.Vector.ex().rotate(this.rotation).mul(this.speed)
        this.position = this.position.add(velocity.mul(t))

        // Max speed due to air and rolling resistance: 292 px/s
        const airResistance = 0.005 * this.speed**2 * Math.sign(this.speed)
        const rollingResistance = 0.25 * this.speed
        const staticResistance = 10 * Math.sign(this.speed)
        this.speed += t * (this.acceleration - airResistance - rollingResistance - staticResistance)
        if (Math.abs(this.speed) < 0.2) this.speed = 0

        // regulate possible rotation based on speed
        this.rotation += t * this.angularVelocity * Math.max(-1, Math.min(1, this.speed/50))

        if (this.speed < 0) {
            this.distanceToTrackBorders = false
            return false
        } else {
            return this.calcDistanceToTrackBorders()
        }
    }

    getBrainDecisions() {
        let inputValues = this.distanceToTrackBorders
        inputValues = inputValues.map(inputValue => 1-Math.exp(-inputValue/100))
        return this.ann.calc(inputValues.concat([this.speed/300]))
    }

    calcDistanceToTrackBorders() {
        const transformedBorders = [new Shaper.Path(), new Shaper.Path()]
        const transfomedAndRotatedBorders = [new Shaper.Path(), new Shaper.Path()]
        const sensorPosition = this.position.add(new Shaper.Vector(5, 0).rotate(this.rotation))

        this.trackBorders[0].points.forEach(point => {
            transformedBorders[0].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            transfomedAndRotatedBorders[0].addPoint(transformedBorders[0].points.at(-1).rotate(-Math.PI / 4))
        })
        this.trackBorders[1].points.forEach(point => {
            transformedBorders[1].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            transfomedAndRotatedBorders[1].addPoint(transformedBorders[1].points.at(-1).rotate(-Math.PI / 4))
        })


        this.distanceToTrackBorders = []



        // Start line
        const startPoint1 = transformedBorders[0].points[0]
        const startPoint2 = transformedBorders[1].points[0]
        const startLineDirection = startPoint2.sub(startPoint1).normalize().rotate(-Math.PI / 2)

        // if one point is left and one point is right -> on collision course
        if ((startPoint1.y <= 0 && startPoint2.y >= 0) || (startPoint1.y >= 0 && startPoint2.y <= 0)) {
            let startLineDistance = startPoint1.x - startPoint1.y * ((startPoint2.x - startPoint1.x) 
                / (startPoint2.y - startPoint1.y)) 
            
            startLineDistance *= Math.sign(startLineDirection.x)

            if (this.startLineDistance !== null) {
                if (this.startLineDistance > 0 && startLineDistance <= 0) {
                    this.rounds++;
                    console.log("Round ", this.rounds, "after", Clock.getCurrentRuntime(), "seconds")
                } else if(this.startLineDistance <= 0 && startLineDistance > 0) this.rounds--;
                
                /*if (this.rounds < 0) {
                    this.distanceToTrackBorders = false
                    this.score = 0
                    return false
                }*/
            }
            
            this.startLineDistance = startLineDistance
        } else {
            this.startLineDistance = null
        }
        

        // Ray 1
        const collisionDistancesRay1 = []

        transformedBorders.forEach(transformedBorder => {
            transformedBorder.points.forEach((point, index) => {
                const nextPoint = transformedBorder.at(index+1)
    
                // if both points of path segment are behind car edge point -> no collision
                if (point.y <= 5 && nextPoint.y <= 5) return
    
                // if both points of path segment are right or left of car edge point -> no collision
                if ((point.x < 0 && nextPoint.x < 0) || (point.x > 0 && nextPoint.x > 0)) return
    
                const collisionDistance = point.y + point.x * ((nextPoint.y - point.y) / (-nextPoint.x + point.x))
                if (collisionDistance > 5) collisionDistancesRay1.push(collisionDistance - 5)
            })
        })

        // if even number of collisions -> car edge point out of track
        if (collisionDistancesRay1.length % 2 == 0) {
            this.distanceToTrackBorders = false
            return false
        }

        this.distanceToTrackBorders.push(Math.min(...collisionDistancesRay1))
        

        // Ray 2
        const collisionDistancesRay2 = []

        transfomedAndRotatedBorders.forEach(transformedBorder => {
            transformedBorder.points.forEach((point, index) => {
                const nextPoint = transformedBorder.at(index+1)
    
                // if both points of path segment are behind car edge point -> no collision
                if (point.y <= 5 && nextPoint.y <= 5) return
    
                // if both points of path segment are right or left of car edge point -> no collision
                if ((point.x < 0 && nextPoint.x < 0) || (point.x > 0 && nextPoint.x > 0)) return
    
                const collisionDistance = point.y + point.x * ((nextPoint.y - point.y) / (-nextPoint.x + point.x))
                if (collisionDistance > 5) collisionDistancesRay2.push(collisionDistance - 5)
            })
        })

        // if even number of collisions -> car edge point out of track
        if (collisionDistancesRay2.length % 2 == 0) {
            this.distanceToTrackBorders = false
            return false
        }

        this.distanceToTrackBorders.push(Math.min(...collisionDistancesRay2))
        

        // Ray 3
        const collisionDistancesRay3 = []

        transformedBorders.forEach(transformedBorder => {
            transformedBorder.points.forEach((point, index) => {
                const nextPoint = transformedBorder.at(index+1)
    
                // if both points of path segment are behind car edge point -> no collision
                if (point.x <= 5 && nextPoint.x <= 5) return
    
                // if both points of path segment are right or left of car edge point -> no collision
                if ((point.y < 0 && nextPoint.y < 0) || (point.y > 0 && nextPoint.y > 0)) return
    
                const collisionDistance = point.x - point.y * ((nextPoint.x - point.x) / (nextPoint.y - point.y))
                if (collisionDistance > 5) collisionDistancesRay3.push(collisionDistance - 5)
            })
        })

        // if even number of collisions -> car edge point out of track
        if (collisionDistancesRay3.length % 2 == 0) {
            this.distanceToTrackBorders = false
            return false
        }

        this.distanceToTrackBorders.push(Math.min(...collisionDistancesRay3))
        

        // Ray 4
        const collisionDistancesRay4 = []

        transfomedAndRotatedBorders.forEach(transformedBorder => {
            transformedBorder.points.forEach((point, index) => {
                const nextPoint = transformedBorder.at(index+1)
    
                // if both points of path segment are behind car edge point -> no collision
                if (point.x <= 5 && nextPoint.x <= 5) return
    
                // if both points of path segment are right or left of car edge point -> no collision
                if ((point.y < 0 && nextPoint.y < 0) || (point.y > 0 && nextPoint.y > 0)) return
    
                const collisionDistance = point.x - point.y * ((nextPoint.x - point.x) / (nextPoint.y - point.y))
                if (collisionDistance > 5) collisionDistancesRay4.push(collisionDistance - 5)
            })
        })

        // if even number of collisions -> car edge point out of track
        if (collisionDistancesRay4.length % 2 == 0) {
            this.distanceToTrackBorders = false
            return false
        }

        this.distanceToTrackBorders.push(Math.min(...collisionDistancesRay4))
        

        // Ray 5
        const collisionDistancesRay5 = []

        transformedBorders.forEach(transformedBorder => {
            transformedBorder.points.forEach((point, index) => {
                const nextPoint = transformedBorder.at(index+1)
    
                // if both points of path segment are behind car edge point -> no collision
                if (point.y >= -5 && nextPoint.y >= -5) return
    
                // if both points of path segment are right or left of car edge point -> no collision
                if ((point.x < 0 && nextPoint.x < 0) || (point.x > 0 && nextPoint.x > 0)) return
    
                const collisionDistance = -point.y - point.x * ((-nextPoint.y + point.y) / (nextPoint.x - point.x))
                if (collisionDistance > 5) collisionDistancesRay5.push(collisionDistance - 5)
            })
        })

        // if even number of collisions -> car edge point out of track
        if (collisionDistancesRay5.length % 2 == 0) {
            this.distanceToTrackBorders = false
            return false
        }

        this.distanceToTrackBorders.push(Math.min(...collisionDistancesRay5))


        return this.distanceToTrackBorders
    }

    calcRoundScore() {
        const frontPosition = this.position.add(new Shaper.Vector(5, 0).rotate(this.rotation))

        let minDistance = Infinity
        let minDistanceScore = 0

        this.trackBorders.forEach(trackBorder => {
            trackBorder.points.forEach((point, index) => {
                const nextPoint = trackBorder.points[(index + 1) % trackBorder.points.length]

                const segmentDirection = nextPoint.sub(point).normalize()
                const segmentLength = nextPoint.sub(point).length()

                let projectedLength = frontPosition.sub(point).dot(segmentDirection)

                projectedLength = Math.min(Math.max(0, projectedLength), segmentLength)

                const projectedDistance = point.add(segmentDirection.mul(projectedLength)).sub(frontPosition).length()

                if (projectedDistance < minDistance) {
                    minDistance = projectedDistance
                    minDistanceScore = index + projectedLength / segmentLength
                }
            })
        })

        // if point with minimal distance is start point (score===0) check exactly, whether 
        // car is in front of or behind start line
        if (minDistanceScore === 0) {
            const transformedBorders = [new Shaper.Path(), new Shaper.Path()]
            const sensorPosition = this.position.add(new Shaper.Vector(5, 0).rotate(this.rotation))

            this.trackBorders[0].points.forEach(point => {
                transformedBorders[0].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            })
            this.trackBorders[1].points.forEach(point => {
                transformedBorders[1].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            })
            

            const startPoint1 = transformedBorders[0].points[0]
            const startPoint2 = transformedBorders[1].points[0]
            const startLineDirection = startPoint2.sub(startPoint1).normalize().rotate(-Math.PI / 2)

            let startLineDistance = startPoint1.x - startPoint1.y * ((startPoint2.x - startPoint1.x) 
            / (startPoint2.y - startPoint1.y)) 
        
            startLineDistance *= Math.sign(startLineDirection.x)

            if (startLineDistance > 0) {
                // behind start line -> adjust score
                minDistanceScore = 380
            }
        }
        
        return minDistanceScore
    }

    calcScore() {
        if (this.score !== null) return

        this.score = this.rounds * this.trackBorders[0].points.length + this.calcRoundScore()
    }
}

export {Car}
import { Shaper } from "../Shaper.js"

class Car {
    constructor() {
        this.shape = null

        this.position = Shaper.Vector.zero()
        this.speed = 0
        this.acceleration = 0

        this.rotation = 0
        this.angularVelocity = 0
    }

    step(t=0.1) {
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
    }

    calcDistanceToTrackBorders(trackBorders) {
        const transformedBorders = [new Shaper.Path(), new Shaper.Path()]
        const transfomedAndRotatedBorders = [new Shaper.Path(), new Shaper.Path()]
        const sensorPosition = this.position.add(new Shaper.Vector(5, 0).rotate(this.rotation))

        trackBorders[0].points.forEach(point => {
            transformedBorders[0].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            transfomedAndRotatedBorders[0].addPoint(transformedBorders[0].points.at(-1).rotate(-Math.PI / 4))
        })
        trackBorders[1].points.forEach(point => {
            transformedBorders[1].addPoint(point.sub(sensorPosition).rotate(-this.rotation))
            transfomedAndRotatedBorders[1].addPoint(transformedBorders[1].points.at(-1).rotate(-Math.PI / 4))
        })


        const collisionDistances = []
        

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
        if (collisionDistancesRay1.length % 2 == 0) return false

        collisionDistances.push(Math.min(...collisionDistancesRay1))
        

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
        if (collisionDistancesRay2.length % 2 == 0) return false

        collisionDistances.push(Math.min(...collisionDistancesRay2))
        

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
        if (collisionDistancesRay3.length % 2 == 0) return false

        collisionDistances.push(Math.min(...collisionDistancesRay3))
        

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
        if (collisionDistancesRay4.length % 2 == 0) return false

        collisionDistances.push(Math.min(...collisionDistancesRay4))
        

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
        if (collisionDistancesRay5.length % 2 == 0) return false

        collisionDistances.push(Math.min(...collisionDistancesRay5))


        return collisionDistances
    }
}

export {Car}
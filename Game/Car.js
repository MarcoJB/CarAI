import { Vector2D } from "../Vector/Vector2D.js"

class Car {
    constructor() {
        this.shape = null

        this.position = Vector2D.zero()
        this.speed = 0
        this.acceleration = 0

        this.rotation = 0
        this.angularVelocity = 0
    }

    step(t=0.1) {
        const velocity = Vector2D.ex().rotate(this.rotation).mul(this.speed)
        this.position = this.position.add(velocity.mul(t))

        // Max speed due to air and rolling resistance: 292 px/s
        const airResistance = 0.005 * this.speed**2 * Math.sign(this.speed)
        const rollingResistance = 0.25 * this.speed
        this.speed += t * (this.acceleration - airResistance - rollingResistance)
        console.log(this.speed, airResistance, rollingResistance)

        // regulate possible rotation
        this.rotation += t * this.angularVelocity * Math.max(-1, Math.min(1, this.speed/50))
    }
}

export {Car}
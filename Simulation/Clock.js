class Clock {
    static step = 0.1
    static interval = null
    static eventListeners = {
        start: [],
        tick: [],
        stop: [],
        pause: [],
        continue: [],
        finish: [],
    }
    static #runtime = 0
    static #duration = null

    static start(duration=null) {
        Clock.#runtime = 0
        Clock.#duration = duration
        console.log("Clock started", this.#duration, "sec")
        Clock.#callEventListeners("start")
        Clock.interval = setInterval(() => Clock.#tick(), Clock.step*1000)
    }

    static stop() {
        console.log("Clock stopped")
        clearInterval(Clock.interval)
        Clock.#callEventListeners("stop")
    }

    static finish() {
        console.log("Clock finished")
        clearInterval(Clock.interval)
        Clock.#callEventListeners("finish")
    }

    static #tick() {
        Clock.#callEventListeners("tick")
        Clock.#runtime += Clock.step
        if (Clock.#duration !== null && Clock.#runtime >= Clock.#duration) {
            Clock.finish()
        }
    }

    static addEventListener(event, callback) {
        if (Clock.eventListeners[event]) {
            Clock.eventListeners[event].push(callback)
        } else {
            console.log("Unknown event: " + event)
        }
    }

    static getCurrentRuntime() {
        return this.#runtime
    }

    static #callEventListeners(event, ...params) {
        if (Clock.eventListeners[event]) {
            Clock.eventListeners[event].forEach(eventListener => {
                eventListener(...params)
            })
        } else {
            console.log("Unknown event: " + event)
        }
    }
}

export {Clock}
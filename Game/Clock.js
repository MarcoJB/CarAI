class Clock {
    static step = 0.1
    static interval = null
    static eventListeners = {
        start: [],
        tick: [],
        stop: [],
        pause: [],
        continue: []
    }

    static start() {
        Clock.#callEventListeners("start")
        Clock.interval = setInterval(() => Clock.#tick(), Clock.step*1000)
        console.log("Clock started")
    }

    static stop() {
        Clock.#callEventListeners("start")
        clearInterval(Clock.interval)
        console.log("Clock stopped")
    }

    static #tick() {
        Clock.#callEventListeners("tick")
    }

    static addEventListener(event, callback) {
        if (Clock.eventListeners[event]) {
            Clock.eventListeners[event].push(callback)
        } else {
            console.log("Unknown event: " + event)
        }
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
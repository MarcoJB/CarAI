class EventCallback {
    constructor(shape, callback, options) {
        this.shape = shape
        this.callback = callback
        this.options = options || {}
    }
}

export {EventCallback}
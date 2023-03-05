class AnchorCoupling {
    constructor(anchor=null) {
        this.anchor = anchor
        this.shapes = {
            anchor: null,
            controlPoints: [null, null],
            controlPointLines: [null, null],
            track: [],
            trackMiddleLine: [],
            trackBorders: [[], []],
            trackBezier: null
        }
    }
}

export {AnchorCoupling}
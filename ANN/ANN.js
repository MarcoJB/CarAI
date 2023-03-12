class ANN {
    constructor() {
        this.layers = []
    }

    addLayer(layer) {
        if (this.layers.length > 0) layer.setInputSize(this.layers.at(-1).neurons.length)
        this.layers.push(layer)
    }

    initWeights() {
        this.layers.forEach(layer => layer.initWeights())
    }

    calc(inputValues) {
        const activations = [inputValues]
        this.layers.forEach(layer => activations.push(layer.calc(activations.at(-1))))
        return activations
    }

    clone() {
        const ann = new ANN()
        this.layers.forEach(layer => ann.addLayer(layer.clone()))
        return ann
    }

    mutate(mutationRate=0.1) {
        this.layers.forEach(layer => layer.mutate(mutationRate))
    }
}

ANN.ActivationFunctions = {
    "Sigmoid": "Sigmoid",
    "ReLU": "ReLU",
    "Tanh": "Tanh",
}

export {ANN}
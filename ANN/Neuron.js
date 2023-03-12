import { ANN } from "./ANN.js"

class Neuron {
    constructor(activationFunction=ANN.ActivationFunctions.Sigmoid, inputSize=null) {
        this.activationFunction = activationFunction
        this.inputSize = inputSize
        this.weights = []
    }

    setInputSize(inputSize) {
        this.inputSize = inputSize
    }

    initWeights() {
        if (!this.inputSize) {
            console.error("Input size must be set before initializing of neuron.")
            return false
        }

        for (let i = 0; i < this.inputSize + 1; i++) {
            this.weights.push(2 * Math.random() - 1)
        }
    }

    calc(inputValues) {
        let activation = 0

        inputValues.concat([1]).forEach((inputValue, index) => {
            activation += this.weights[index] * inputValue
        })

        switch (this.activationFunction) {
            case ANN.ActivationFunctions.Sigmoid:
                return 1 / (1 + Math.exp(-activation))
            case ANN.ActivationFunctions.ReLU:
                return Math.max(0, activation)
            case ANN.ActivationFunctions.Tanh:
                return Math.tanh(activation)
            default:
                return activation
        }
    }

    clone() {
        const neuron = new Neuron(this.activationFunction, this.inputSize)
        neuron.weights = this.weights.slice(0)
        return neuron
    }

    mutate(mutationRate=0.1) {
        this.weights = this.weights.map(weight => weight + 2 * mutationRate * Math.random() - mutationRate)
    }
}

export {Neuron}
import { ANN } from "./ANN.js"
import { Neuron } from "./Neuron.js"

class Layer {
    constructor(numberOfNeurons, activationFunction=ANN.ActivationFunctions.Sigmoid, inputSize=null) {
        this.neurons = []
        for (let i = 0; i < numberOfNeurons; i++) {
            this.neurons.push(new Neuron(activationFunction, inputSize))
        }
    }

    setInputSize(inputSize) {
        this.neurons.forEach(neuron => neuron.setInputSize(inputSize))
    }

    initWeights() {
        this.neurons.forEach(neuron => neuron.initWeights())
    }

    calc(inputValues) {
        const activations = []
        this.neurons.forEach(neuron => activations.push(neuron.calc(inputValues)))
        return activations
    }

    clone() {
        const layer = new Layer(this.neurons.length)
        this.neurons.forEach((neuron, index) => layer.neurons[index] = neuron.clone())
        return layer
    }

    mutate(mutationRate=0.1) {
        this.neurons.forEach(neuron => neuron.mutate(mutationRate))
    }
}

 export {Layer}
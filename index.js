import { ANN } from "./ANN/ANN.js"
import { Layer } from "./ANN/Layer.js"
import { Neuron } from "./ANN/Neuron.js"
import { Game } from "./Game/Game.js"

window.ANN = ANN
window.Layer = Layer
window.Neuon = Neuron

let game

window.addEventListener("load", () => {
    document.querySelector("#activateEditorMode").addEventListener("click", activateEditorMode)
    document.querySelector("#activateSimulationMode").addEventListener("click", activateSimulationMode)

    game = new Game(document.getElementById("trackcanvas"))
    window.game = game

    initEditorMode()
    initSimulationMode()

    activateEditorMode()
    activateSimulationMode()
})


function initEditorMode() {
    const clearBtn = document.getElementById("btnClear")
    const saveBtn = document.getElementById("btnSave")
    const trackWidthInput = document.getElementById("trackWidth")
    const linearizationResolutionInput = document.getElementById("linearizationResolution")
    const showControlPointsCheckBox = document.getElementById("showControlPoints")
    const setStartAnchorButton = document.getElementById("setStartAnchor")
    const togglePathDirectionButton = document.getElementById("togglePathDirection")

    clearBtn.addEventListener("click", () => {
        if (!game.editor) return
        editor.stateManager.clearState()
    })
    saveBtn.addEventListener("click", () => {
        if (!game.editor) return
        editor.stateManager.saveState
    })

    trackWidthInput.addEventListener("input", e => {
        if (!game.editor) return
        game.editor.activeAnchorCoupling.anchor.width = parseInt(e.target.value)
        game.editor.update()
    })

    linearizationResolutionInput.addEventListener("input", e => {
        if (!game.editor) return
        game.editor.linearizationResolution = parseInt(e.target.value)
        game.editor.redraw()
        game.editor.update()
    })

    showControlPointsCheckBox.addEventListener("change", e => {
        if (!game.editor) return
        game.editor.showControlPoints = e.target.checked
        game.editor.redraw()
    })

    setStartAnchorButton.addEventListener("click", () => {
        if (!game.editor) return
        game.editor.path.setStartAnchor(editor.activeAnchorCoupling.anchor)
        game.editor.update()
    })

    togglePathDirectionButton.addEventListener("click", () => {
        if (!game.editor) return
        game.editor.path.reverseAnchors()
        game.editor.update()
    })
}

function activateEditorMode() {
    game.activateEditorMode()

    document.querySelectorAll(".controls").forEach(control => control.style.display = "none")
    document.querySelector("#controls-Editor").style.display = "block"

    const linearizationResolutionInput = document.getElementById("linearizationResolution")
    linearizationResolutionInput.value = game.editor.linearizationResolution

    const showControlPointsCheckBox = document.getElementById("showControlPoints")
    showControlPointsCheckBox.checked = game.editor.showControlPoints
}


function initSimulationMode() {
    const startSimulationButton = document.getElementById("startSimulation")
    startSimulationButton.addEventListener("click", () => {
        game.simulation.start()
        startSimulationButton.style.display = "none"
    })

    /*const nextGenerationButton = document.getElementById("nextGeneration")
    nextGenerationButton.addEventListener("click", () => {
        game.simulation.nextGeneration()
    })*/
}

function activateSimulationMode() {
    game.activateSimulationMode()

    document.querySelectorAll(".controls").forEach(control => control.style.display = "none")
    document.querySelector("#controls-Simulation").style.display = "block"
}


/*window.addEventListener("beforeunload", function (event) {
    // check if there are unsaved changes
    if (!game.stateManager.isSaved) {
      return ""
    }
  });*/
  
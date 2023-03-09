import { Editor } from "../Editor/Editor.js"
import { Scene } from "../Scene/Scene.js"
import { Simulation } from "../Simulation/Simulation.js"

class Game {
    static Modes = {
        Editor: "Editor",
        ManuelDriving: "ManuelDriving",
    }

    constructor(canvas) {
        this.canvas = canvas
        this.scene = new Scene(canvas)
        this.editor = null
        this.simulation = null
    }

    activateEditorMode() {
        this.scene.reset()
        this.simulation = null
        this.editor = new Editor(this.scene)
    }

    activateSimulationMode() {
        this.scene.reset()
        if (this.editor) {
            this.simulation = new Simulation(this.editor.getBorders(), this.scene)
            this.editor = null
        }
    }
}

export {Game}
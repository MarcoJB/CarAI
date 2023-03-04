import { Game } from "./Game/Game.js"

const game = new Game(document.getElementsByTagName("canvas")[0])
window.game = game

window.addEventListener("load", () => {
    const clearBtn = document.getElementById("btnClear")
    const saveBtn = document.getElementById("btnSave")
    const trackWidthInput = document.getElementById("trackWidth")
    const linearizationResolutionInput = document.getElementById("linearizationResolution")
    const showControlPointsCheckBox = document.getElementById("showControlPoints")
    const setStartAnchorButton = document.getElementById("setStartAnchor")
    const togglePathDirectionButton = document.getElementById("togglePathDirection")

    linearizationResolutionInput.value = game.linearizationResolution

    clearBtn.addEventListener("click", game.stateManager.clearState)
    saveBtn.addEventListener("click", game.stateManager.saveState)

    trackWidthInput.addEventListener("input", e => {
        game.activeAnchorCoupling.anchor.width = parseInt(e.target.value)
        game.update()
    })

    linearizationResolutionInput.addEventListener("input", e => {
        game.linearizationResolution = parseInt(e.target.value)
        game.redraw()
        game.update()
    })

    showControlPointsCheckBox.addEventListener("change", e => {
        game.showControlPoints = e.target.checked
        game.redraw()
    })

    setStartAnchorButton.addEventListener("click", () => {
        game.path.setStartAnchor(game.activeAnchorCoupling.anchor)
        game.update()
    })

    togglePathDirectionButton.addEventListener("click", () => {
        game.path.reverseAnchors()
        game.update()
    })
})

/*window.addEventListener("beforeunload", function (event) {
    // check if there are unsaved changes
    if (!game.stateManager.isSaved) {
      return ""
    }
  });*/
  
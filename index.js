import { Game } from "./Game/Game.js"

const game = new Game(document.getElementsByTagName("canvas")[0])

window.addEventListener("load", () => {
    const clearBtn = document.getElementById("btnClear")
    const saveBtn = document.getElementById("btnSave")
    const trackWidthInput = document.getElementById("trackWidth")
    const linearizationResolutionInput = document.getElementById("linearizationResolution")
    linearizationResolutionInput.value = game.linearizationResolution

    clearBtn.addEventListener("click", game.stateManager.clearState)
    saveBtn.addEventListener("click", game.stateManager.saveState)

    trackWidthInput.addEventListener("input", e => {
        game.activeAnchorCoupling.anchor.width = e.target.value
        game.update()
    })

    linearizationResolutionInput.addEventListener("input", e => {
        game.linearizationResolution = e.target.value
        game.redraw()
        game.update()
    })
})

/*window.addEventListener("beforeunload", function (event) {
    // check if there are unsaved changes
    if (!game.stateManager.isSaved) {
      return ""
    }
  });*/
  
import { Game } from "./Game/Game.js"

const game = new Game(document.getElementsByTagName("canvas")[0])

window.addEventListener("load", () => {
    const clearBtn = document.getElementById("btnClear")
    const saveBtn = document.getElementById("btnSave")

    clearBtn.addEventListener("click", game.stateManager.clearState)
    saveBtn.addEventListener("click", game.stateManager.saveState)
})

/*window.addEventListener("beforeunload", function (event) {
    // check if there are unsaved changes
    if (!game.stateManager.isSaved) {
      return ""
    }
  });*/
  
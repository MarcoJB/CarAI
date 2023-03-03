import { Game } from "./Game/Game.js"
import { Anchor } from "./Path/Anchor.js"
import { Vector2D } from "./Vector/Vector2D.js"

const game = new Game(document.getElementsByTagName("canvas")[0])

/*game.path.addAnchor(new Anchor(500, 150))
game.path.addAnchor(new Anchor(700, 450))
game.path.addAnchor(new Anchor(300, 450))

game.render()*/

let dragStartPosition = null
let draggingAnchor = null
let draggingStarted = false

game.scene.canvas.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return

    dragStartPosition = new Vector2D(e.offsetX, e.offsetY)

    game.path.anchors.every(anchor => {
        if (Vector2D.subtract(anchor.position, dragStartPosition).length() <= 10) {
            draggingAnchor = anchor
            return false
        }
        return true
    })
})
game.scene.canvas.addEventListener("mousemove", (e) => {
    if (draggingAnchor) {
        draggingStarted = true
        const mousePosition = new Vector2D(e.offsetX, e.offsetY)
        const differenceVector = Vector2D.subtract(mousePosition, dragStartPosition) 
        draggingAnchor.position = Vector2D.add(draggingAnchor.position, differenceVector)
        dragStartPosition = mousePosition

        game.synchronize()
        game.scene.render()
    }
})
window.addEventListener("mouseup", (e) => {
    setTimeout(() => {
        draggingAnchor = null
        draggingStarted = false
    })
})
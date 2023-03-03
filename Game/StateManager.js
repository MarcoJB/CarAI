import { Anchor } from "../Path/Anchor.js"

export class StateManager {
    startAnchors = [
        new Anchor(500, 150),
        new Anchor(700, 450),
        new Anchor(300, 450)
    ]
    localStorageObjectName = "gameState"

    constructor(path) {
        this.path = path;
        this.loadState()
    }

    saveState() {
        const gameState = { anchors: this.path.anchors }
        localStorage.setItem(this.localStorageObjectName, gameState)
    }

    loadState() {
        const localStorageData = localStorage.getItem(this.localStorageObjectName);
        if (localStorageData) {
            try {
                const gameState = JSON.parse(localStorageData);
                this.currentAnchors = gameState.anchors;
                console.log(gameState)
            } catch (error) {
                console.error(`Game state corrupted - cannot parse ${localStorageData}`)
            }
        }

        if (!this.currentAnchors) {
            this.currentAnchors = this.startAnchors;
        }
    }
}
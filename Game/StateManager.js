import { Anchor } from "../Path/Anchor.js"

export class StateManager {
    static path;
    static localStorageObjectName = "gameState"
    static currentAnchors
    static startAnchors = [[500, 150], [700, 450], [300, 450]]

    static setPath(path) {
        StateManager.path = path;
        StateManager.loadState()
    }

    static transformAnchors() {
        return StateManager.path.anchors.map(anchor => [anchor.position.x, anchor.position.y])
    }

    static saveState() {
        const gameState = {
            anchors: StateManager.transformAnchors()
        }
        localStorage.setItem(StateManager.localStorageObjectName, JSON.stringify(gameState))
    }

    static loadState(returnState = false) {
        console.log("Loading state...")
        const localStorageData = localStorage.getItem(StateManager.localStorageObjectName);
        if (localStorageData) {
            try {
                const gameState = JSON.parse(localStorageData);
                if (returnState) {
                    return gameState
                }
                StateManager.currentAnchors = gameState.anchors.map(anchor => new Anchor(anchor[0], anchor[1]));
                console.log(`Loaded this data: ${localStorageData}`)
            } catch (error) {
                console.error(`Game state corrupted - cannot parse ${localStorageData}`)
            }
        }

        if (!StateManager.currentAnchors) {
            StateManager.currentAnchors = StateManager.startAnchors.map(anchor => new Anchor(anchor[0], anchor[1]));
        }
    }

    static isSaved() {
        const localStorageState = StateManager.loadState(true) || { anchors: StateManager.startAnchors }
        const currentState = { anchors: StateManager.transformAnchors() }

        return (JSON.stringify(localStorageState.anchors) === JSON.stringify(currentState.anchors))
    }

    static clearState() {
        console.log("Clearing state...")
        localStorage.removeItem(StateManager.localStorageObjectName)
    }
}
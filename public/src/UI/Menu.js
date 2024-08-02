import Game from "../Game"
import Controller from "../player/Controller"


export default class Menu {

    constructor(container, game) {
        this.game = game

        this.container = container
        this.loadingScreen = document.getElementById('loading-screen')
        this.spawnBtn = document.getElementById("spawn")
        this.worldType = document.getElementById("world-type")

        this.data = { worldType: 'earth' }

        Controller.inGUI = true
        this.connect()
    }

    connect() {
        this.fillWorldTypes()
        this.spawnBtn.addEventListener("click", this.onSpawn.bind(this))
        this.worldType.addEventListener('change', this.onWorldType.bind(this))
        this.game.addEventListener('loading', this.onLoadingProgress.bind(this))
    }

    async onSpawn(e) {
        this.show(this.loadingScreen)
        // setTimeout(async () => {
            await this.game.spawn(this.data.worldType)
            this.hide(this.loadingScreen)
            this.hide()

        // }, 500)
    }

    async onWorldType(e) {
        this.data.worldType = e.target.value

    }

    onLoadingProgress({ detail }) {
        if(detail == 'FINISH')
            return this.hide(this.loadingScreen)
        
        this.loadingScreen.innerHTML = `<h3>${detail}</h3>`

    }

    hide(el = this.container) {
        el.classList.add('hide')
        if(el == this.container) {
            Controller.inGUI = false

        }
    }

    show(el = this.container) {
        el.classList.remove('hide')
        if(el == this.container)
            Controller.inGUI = true
    }

    fillWorldTypes() {
        for(let type in Game.generators()) {
            const opt = document.createElement('option')
            opt.innerText = type
            this.worldType.appendChild(opt)
        }
    }
}
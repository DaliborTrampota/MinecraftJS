import InterfaceFactory from "./InterfaceFactory.js";
import MachineInterface from "./MachineInterface.js";


export default class FurnaceInterface extends MachineInterface {

    #updateList = this.updateLayers.bind(this)
    #onRecipeFinish = this.onRecipeFinish.bind(this)

    constructor(entity, inventory) {
        super(entity, inventory)
        this.entity = entity
        this.html = new InterfaceFactory(5, 5, 'furnace')
            .section(3, 2, 0, 0, 'input')
            .section(1, 1, 4, 2, 'fuel')
            .section(2, 1, 6, 0.5, 'output')
            .build(true, this)

        this.entity.addEventListener('progress', this.#updateList)//.bind(this))
        this.entity.addEventListener('recipeFinished', this.#onRecipeFinish)//.bind(this))
        this.createLayers()
    }

    close() {
        super.close()
        this.entity.removeEventListener('progress', this.#updateList)//.bind(this))
        this.entity.removeEventListener('recipeFinished', this.#onRecipeFinish)//.bind(this))
    }

    createLayers() {
        const layers = document.createElement('div')
        layers.setAttribute('class', 'gui-layers')
        // this.layersDiv.setAttribute('class', 'gui-container')
        this.html.appendChild(layers)
        this.layersDiv = layers
    }

    drawLayers() {
        this.layersDiv.innerHTML = ''
        
        for(let layer in this.layers) {
            // const layerImg = document.createElement('img')
            // layerImg.setAttribute('class', 'pixelated gui-bg')
            // layerImg.setAttribute('alt', 'progress arrow')
            // layerImg.src = this.layers[layer]
            this.layersDiv.appendChild(this.layers[layer])
        }
    }

    createProgressLayers(percentage) {
        const canvas = document.createElement('canvas')
        canvas.setAttribute('class', 'gui-layer')
        canvas.id = "progressLayer"

        const arrow = window.images.progressArrow

        canvas.width = arrow.width
        canvas.height = arrow.height

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false

        ctx.drawImage(arrow, 
            0, 0, Math.floor(arrow.width*percentage), arrow.height,
            0, 0, Math.floor(arrow.width*percentage), arrow.height)
            
        const { top, left } = new InterfaceFactory(5, 5).position(5, 1, arrow, { gapAlignY: true })
        canvas.style.top = top + 'px'//InterfaceFactory.Slot.HEIGHT + 2 - arrow.height/2+ 'px';
        canvas.style.left = left + 'px'//InterfaceFactory.Slot.WIDTH*4 + 20 + InterfaceFactory.Slot.WIDTH/2- arrow.width/2 + 'px';
        return canvas
        // return this.createLayerElement({
        //     image: dataURL,
        //     width: this.width,
        //     height: this.height,
        // })
    }

    updateLayers({ detail: recipe }) {
        //console.log(recipe)
        this.layers.progress = this.createProgressLayers(recipe.progress)

        this.drawLayers()
    }

    onRecipeFinish({ detail: recipe }) {
        this.update()
    }

    createLayerElement(layer) {
        const bg = document.createElement('img')
        bg.setAttribute('class', 'gui-bg')
        bg.setAttribute('draggable', 'false')
        bg.src = layer.image
        bg.style.top = "-8px"
        bg.style.left = "-8px"
        bg.style.width = layer.width + 'px'
        bg.style.height = layer.height + 'px'
        //this.html.appendChild(bg)
        return bg
    }

}
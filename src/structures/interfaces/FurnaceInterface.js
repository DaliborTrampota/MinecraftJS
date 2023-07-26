import InterfaceFactory from "./InterfaceFactory.js";
import MachineInterface from "./MachineInterface.js";


export default class FurnaceInterface extends MachineInterface {

    constructor(entity) {
        super(entity)
        this.entity = entity
        this.html = new InterfaceFactory(5, 5, 'furnace')
            .section(3, 2, 0, 0, 'input')
            .section(1, 1, 4, 2, 'fuel')
            .section(2, 1, 6, 0.5, 'output')
            .build(true, this)
    }

    createLayers() {
        this.layers.progress = this.createProgressLayers()
    }

    createProgressLayers() {
        const canvas = document.createElement('canvas')
        canvas.width = this.width
        canvas.height = this.height
        console.log(this.html, this.width, this.height)

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false

        const arrow = window.images.progressArrow
        ctx.drawImage(arrow, this.width/2 - arrow.width/2, this.height/2 - arrow.height/2)//, arrow.width, arrow.height)

        let dataURL = canvas.toDataURL()
        canvas.remove()

        return this.createLayerElement({
            image: dataURL,
            width: this.width,
            height: this.height
        })
    }

    updateLayers(entity) {
        
    }

    createLayerElement(layer) {
        const bg = document.createElement('img')
        bg.setAttribute('class', 'gui-bg')
        bg.setAttribute('draggable', 'false')
        bg.src = layer.image
        bg.style.width = layer.width + 'px'
        bg.style.height = layer.height + 'px'
        this.html.appendChild(bg)
        return bg
    }

}
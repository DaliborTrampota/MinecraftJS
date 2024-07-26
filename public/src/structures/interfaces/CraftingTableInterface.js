import InterfaceFactory from "./InterfaceFactory.js";
import MachineInterface from "./MachineInterface.js";


export default class CraftingTableInterface extends MachineInterface {

    #onRecipePreview = this.onRecipePreview.bind(this)
    #onRecipeFinish = this.onRecipeFinish.bind(this)

    constructor(entity, inventory) {
        super(entity, inventory)
        this.html = new InterfaceFactory(5, 5, 'crafting')
            .section(3, 3, 0, 0, 'input')
            .section(1, 1, 5, 1, 'output')
            .build(true, this)

        this.entity.addEventListener('recipeFinished', this.#onRecipeFinish)//.bind(this))
        this.entity.addEventListener('recipePreview', this.#onRecipePreview)//.bind(this))

        this.createLayers()
    }

    close() {
        super.close()
        this.entity.removeEventListener('recipeFinished', this.#onRecipeFinish)//.bind(this))
        this.entity.removeEventListener('recipePreview', this.#onRecipePreview)//.bind(this))
    }


    createArrow(visible) {
        if (!visible)
            return document.createElement('span')
        
        const canvas = document.createElement('canvas')
        canvas.setAttribute('class', 'gui-layer')
        canvas.id = "progressLayer"

        const arrow = window.images.progressArrow

        canvas.width = arrow.width
        canvas.height = arrow.height

        const ctx = canvas.getContext('2d')
        ctx.imageSmoothingEnabled = false

        ctx.drawImage(arrow, 
            0, 0, arrow.width, arrow.height,
            0, 0, arrow.width, arrow.height)
            
        const { top, left } = new InterfaceFactory(5, 5).position(4.5, 1.5, arrow, { gapAlignY: true })
        canvas.style.top = top + 'px'//InterfaceFactory.Slot.HEIGHT + 2 - arrow.height/2+ 'px';
        canvas.style.left = left + 'px'//InterfaceFactory.Slot.WIDTH*4 + 20 + InterfaceFactory.Slot.WIDTH/2- arrow.width/2 + 'px';
        return canvas
    }

    onRecipePreview({ detail: visible }) {
        this.layers.progress = this.createArrow(visible)
        this.update()
        this.drawLayers()
    }

    onRecipeFinish({ detail: recipe }) {
        this.update()
    }

}
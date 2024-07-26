import InterfaceFactory from "./InterfaceFactory.js";
import Interface from "./Interface.js";


export default class InventoryCrafting extends Interface {

    #onRecipePreview = this.onRecipePreview.bind(this)
    #onRecipeFinish = this.onRecipeFinish.bind(this)

    constructor(player, invEntity){
        super()
        this.player = player
        this.html = new InterfaceFactory(5, 5, 'inventory-crafting')
            .section(2, 2, 0, 0, 'input')
            .section(1, 1, 3.5, 0.5, 'output')
            .build(true, this)
            
        this.layers = {}
        
        invEntity.addEventListener('recipeFinished', this.#onRecipeFinish)
        invEntity.addEventListener('recipePreview', this.#onRecipePreview)

        this.createLayers()
    }

    get inv() {
        return this.player.inventory
    }

    get entity() {
        return this.player.inventory
    }
    
    slots(section) {
        const slots = this.inv[`${section}Slots`]
        if(!slots) throw new Error(`Invalid inventory crafting section: ${section}`)
        return slots
    }

    update() {
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let ID = this.htmlSlots[i].dataset.id
            let section = this.htmlSlots[i].dataset.section
            let stack = this.slots(section)[ID]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
    }
    

    swapOrMerge(origin, target, data) {
        const stack = super.swapOrMerge(origin, target, data)
        this.inv.onSlotChange(stack, data.targetSection, data.targetID)
        return stack
    }

    onDrop(e){
        const data = super.onDrop(e)
        if (!data) return false
        
        const originInterface = data.originInterface == this.name ? this : this.inv.interface//todo figure out
        const originSlots = originInterface.slots(data.originSection)
        const targetSlots = this.slots(data.targetSection)

        const stack = this.swapOrMerge(originSlots, targetSlots, data)
        this.update()
        if(this != originInterface)
            originInterface.update()
        
        originInterface.entity.onSlotChange(stack, data.originSection)
    }

    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []
        
        if(!this.entity.validateItem(e.target.dataset.section, null))
            return console.debug("Invalid slot")

        if(!ifaceName || ifaceName == e.target.parentNode.dataset.interface) return super.allowDrop(e)

        const originInterface = ifaceName == this.name ? this : this.inv.interface//todo figure out
        const originSlots = originInterface.slots(section)
        const originStack = originSlots[Number(slotID)]
        

        this.allowDropMergeCheck(e.target.dataset.section, Number(e.target.dataset.id), originStack) 
            ? e.preventDefault() 
            : console.debug("Slot already occupied")
    }

    close() {
        // this.entity.removeEventListener('recipeFinished', this.#onRecipeFinish)
        // this.entity.removeEventListener('recipePreview', this.#onRecipePreview)
        this.inv.dropCrafting()
    }
    

    /**
     * Creates container for layers
     */
    createLayers() {
        const layers = document.createElement('div')
        layers.setAttribute('class', 'gui-layers')
        // this.layersDiv.setAttribute('class', 'gui-container')
        this.html.appendChild(layers)
        this.layersDiv = layers
    }

    /**
     * Draws layers on the screen. Should be called from updateLayers.
     */
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
            
        const { top, left } = new InterfaceFactory(5, 5).position(3.25, 1, arrow, { gapAlignY: true })
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
        console.log('finish')
        this.update()
    }
}
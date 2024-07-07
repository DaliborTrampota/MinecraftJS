import Interface from "./Interface.js";
import InterfaceFactory from "./InterfaceFactory.js";


export default class MachineInterface extends Interface {

    constructor(entity, inventory){
        super()
        this.entity = entity
        this.interfaces = {}
        this.layers = {}

        this.inventory = inventory
        
        //window.game.addUpdateSub(this, this.updateLayers.bind(this))
    }

    slots(section) {
        const slots = this.entity[`${section}Slots`]
        if(!slots) throw new Error(`Invalid section: ${section}`)
        return slots
    }


    // setInterface(html, background) {
    //     console.log("setting interface")
    //     super.setInterface(html, background)
    //     this.createLayers()
    //     // for(const layer in this.layers) {
    //     //     this.layers[layer].node.src = this.layers[layer].image
    //     // }
    // }

    update() {
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let ID = this.htmlSlots[i].dataset.id
            let section = this.htmlSlots[i].dataset.section
            let stack = this.slots(section)[ID]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
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
     * Runs on every 'progress' event from recipe.
     * Need to manually subscribe to the progress event on entity instance.
     * @param {Number} delta 
     */
    updateLayers(delta) {}

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

    // dragStart(e) {
    //     super.dragStart(e)
    //     this.entity.onSlotChange()
    // }

    swapOrMerge(origin, target, data) {
        const stack = super.swapOrMerge(origin, target, data)
        this.entity.onSlotChange(stack, data.targetSection, data.targetID)
        return stack
    }

    onDrop(e){
        const data = super.onDrop(e)
        
        const originInterface = data.originInterface == this.name ? this : this.inventory//todo figure out
        const originSlots = originInterface.slots(data.originSection)
        const targetSlots = this.slots(data.targetSection)

        const stack = this.swapOrMerge(originSlots, targetSlots, data)

        originInterface.update()
        if(this != originInterface)
            this.update()

        this.entity.onSlotChange(stack, data.targetSection)
        // originInterface.entity.onSlotChange(stack, data.originSection)
    }

    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []
        if(!ifaceName || ifaceName == e.target.parentNode.dataset.interface) return super.allowDrop(e)
        
        const originInterface = ifaceName == this.name ? this : this.inventory//todo figure out
        const originSlots = originInterface.slots(section)
        const originStack = originSlots[Number(slotID)]

        if(!this.entity.validateItem(e.target.dataset.section, originStack?.item))
            return console.debug("Invalid item")
        
        this.allowDropMergeCheck(e.target.dataset.section, Number(e.target.dataset.id), originStack) 
            ? e.preventDefault() 
            : console.debug("Slot already occupied")
        
    }

    close() {
        //do not call close on interface, inventory calls it, only once request pointer lock
    }
}
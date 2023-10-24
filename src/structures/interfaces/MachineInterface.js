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

    setInterface(html, background) {
        super.setInterface(html, background)
        this.createLayers()
        // for(const layer in this.layers) {
        //     this.layers[layer].node.src = this.layers[layer].image
        // }
    }

    update() {
        console.log('update')
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let ID = this.htmlSlots[i].dataset.id
            let section = this.htmlSlots[i].dataset.section
            let stack = this.entity.slots(section)[ID]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
    }

    createLayers() {}

    updateLayers(delta) {}

    // dragStart(e) {
    //     super.dragStart(e)
    //     this.entity.onSlotChange()
    // }

    swap(origin, target, data) {
        const stack = super.swap(origin, target, data)
        this.entity.onSlotChange(stack, data.targetSection, data.targetID)
        return stack
    }

    onDrop(e){
        const data = super.onDrop(e)
        
        const originInterface = data.originInterface == this.name ? this : this.inventory//todo figure out
        const originSlots = originInterface.slots(data.originSection)
        const targetSlots = this.slots(data.targetSection)

        const stack = this.swap(originSlots, targetSlots, data)

        originInterface.update()
        if(this != originInterface)
            this.update()

        this.entity.onSlotChange(stack, data.targetSection)
        // originInterface.entity.onSlotChange(stack, data.originSection)
    }

    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []
        if(!ifaceName) return super.allowDrop(e)
        
        const originInterface = ifaceName == this.name ? this : this.inventory//todo figure out
        const originSlots = originInterface.slots(section)
        const stack = originSlots[Number(slotID)]

        this.entity.validateItem(e.target.dataset.section, stack?.item) ? super.allowDrop(e) : console.log("Invalid item")
    }
}
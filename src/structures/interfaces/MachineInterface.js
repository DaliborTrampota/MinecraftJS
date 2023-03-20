import Interface from "./Interface.js";
import InterfaceFactory from "./InterfaceFactory.js";
import Inventory from "./PlayerInventory.js";


export default class MachineInterface extends Interface {

    constructor(entity){
        super()
        this.entity = entity
        this.interfaces = {}
    }

    open(iface) {
        super.open()
        this.interfaces[iface.html.dataset.interface] = iface
    }

    update() {
        super.update()
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let ID = this.htmlSlots[i].dataset.id
            let section = this.htmlSlots[i].dataset.section
            let stack = this.entity.slots(section)[ID]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
    }

    onDrop(e){
        const data = super.onDrop(e)
        
        let originSlots
        const targetSlots = this.entity.slots(data.targetSection)

        const originInterface = this.interfaces[data.originInterface] ?? this
        if(originInterface instanceof Inventory) {
            originSlots = originInterface.slots
        } else {
            originSlots = originInterface.entity.slots(data.originSection)
        }
        
        const temp = originSlots[data.originID]
        originSlots[data.originID] = targetSlots[data.targetID]
        targetSlots[data.targetID] = temp
        
        originInterface.update()
        this.update()
    }
}
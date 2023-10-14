import InterfaceFactory from "./InterfaceFactory.js";
import Interface from "./Interface.js";
import Inventory from "../entities/Inventory.js"


export default class InventoryInterface extends Interface {

    constructor(player){
        super()
        this.player = player

        this.htmlHotbarSlots = new InterfaceFactory.Hotbar(Inventory.HOTBAR_SIZE)
            .build(document.getElementById("hotbar"))
        

        this.interfaces = {}

        //this.background = '/src/resources/images/gui/inventory.png'

        this.html = new InterfaceFactory(5, 5, 'player-inventory')
            .section(Inventory.COL, Inventory.ROW, 0, 0, 'slots')
            .section(Inventory.HOTBAR_SIZE, 1, 0, Inventory.ROW + 0.25, 'hotbar')
            .build(true, this)
    }

    get inv() {
        return this.player.inventory
    }

    selectHotbar(index) {
        let curSlot = this.htmlHotbarSlots[this.inv.selectedSlot]
        let newSlot = this.htmlHotbarSlots[index]

        curSlot.html.id = ""
        newSlot.html.id = "selected"
    }

    draw() {
        super.draw()
        this.update()
    }

    open(entity) {
        if(entity) {
            const iface = new entity.interfaceClass(entity, this)
            iface.open()
            this.interfaces[iface.name] = iface
            //iface.interfaces[this.name] = this
        }
        super.open()
        this.player.controller.inGUI = this.isOpen
    }

    close() {
        super.close()
        for(const iface in this.interfaces) {
            this.interfaces[iface].close()
        }
        this.interfaces = {}
        this.player.controller.inGUI = this.isOpen
    }

    update() {
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let stack = this.inv.slots[i]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
        this.updateHotbar()
    }

    updateHotbar() {
        const setSlot = (html, stack) => {
            html.count.innerHTML = stack?.amount ?? ''
            html.image.src = stack?.item.image ?? InterfaceFactory.Slot.EMPTY
            if(stack?.item.pixelated) html.image.classList.add('pixelated')
            else html.image.classList.remove('pixelated')
            
        }
        for(let i = 0; i < this.inv.hotbar.length; ++i) {
            const html = this.htmlHotbarSlots[i]
            if(!this.inv.hotbar[i]?.amount) this.inv.hotbar[i] = undefined
            setSlot(html, this.inv.hotbar[i])
        }
    }

    slots(section) {
        const slots = this.inv[section]
        if(!slots) throw new Error(`Invalid inventory section: ${section}`)
        return slots
    }

    onDrop(e){
        const data = super.onDrop(e)
        
        const originInterface = this.interfaces[data.originInterface] ?? this
        const targetSlots = this.slots(data.targetSection)
        const originSlots = originInterface.slots(data.originSection)

        const stack = this.swap(originSlots, targetSlots, data)
        this.update()
        if(this != originInterface)
            originInterface.update()

        originInterface.entity.onSlotChange(stack, data.targetSection)
    }

    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []
        if(!ifaceName || ifaceName == e.target.parentNode.dataset.interface) return super.allowDrop(e)
        
        //const originInterface = this.interfaces[ifaceName] ?? this
        //const originSlots = originInterface.slots(section)
        //const stack = originSlots[Number(slotID)]
        
        const curStack = this.slots(e.target.dataset.section)[Number(e.target.dataset.id)]
        !curStack ? super.allowDrop(e) : console.log("Slot already occupied")
    }
}
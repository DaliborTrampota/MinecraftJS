import InterfaceFactory from "./InterfaceFactory.js";
import Interface from "./Interface.js";


export default class Inventory extends Interface {

    static COL = 10
    static ROW = 4

    constructor(player, hotbarSize = 10){
        super()
        this.player = player
        this.hotbarSize = hotbarSize
        this.htmlHotbarSlots = new InterfaceFactory.Hotbar(hotbarSize).build(document.getElementById("hotbar"))
        

        this.slots = new Array(Inventory.COL * Inventory.ROW + hotbarSize)
        this.hotbar = this.slots.view(this.slots.length - hotbarSize, this.slots.length) //view to the hotbar slots in the inventory
        this.selectedSlot = 0

        this.interfaces = {}

        //this.background = '/src/resources/images/gui/inventory.png'

        this.html = new InterfaceFactory(5, 5, 'player-inventory')
            .section(Inventory.COL, Inventory.ROW, 0, 0, 'inventory')
            .section(hotbarSize, 1, 0, Inventory.ROW + 0.25, 'hotbar')
            .build(true, this)
    }

    get hotbarStartIndex() {
        return this.slots.length - this.hotbar.length
    }

    get slot() {
        return this.hotbar[this.selectedSlot]
    }

    set slot(index) {
        if(index >= this.hotbar.length) index = 0
        else if(index < 0) index = this.hotbar.length - 1

        let curSlot = this.htmlHotbarSlots[this.selectedSlot]
        let newSlot = this.htmlHotbarSlots[index]

        curSlot.html.id = ""
        newSlot.html.id = "selected"

        this.selectedSlot = index
    }

    close() {
        super.close()
        this.interfaces = {}
    }

    toggle() {
        super.toggle()
        this.player.controller.inGUI = this.isOpen
    }

    update() {
        super.update()
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let stack = this.slots[i]
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
        for(let i = 0; i < this.hotbar.length; ++i) {
            const html = this.htmlHotbarSlots[i]
            if(!this.hotbar[i]?.amount) this.hotbar[i] = undefined
            setSlot(html, this.hotbar[i])
        }
    }

    addStack(stack) {
        while(stack.amount){
            let index = this.getSlotFor(stack)
            if(index != -1) {
                this.slots[index].merge(stack)
                continue
            }
            index = this.getEmptySlot()
            if(index != -1) {
                this.slots[index] = stack
                break
            }

            console.log('Inventory is full')
            break // full or empty stack was added to empty slot
        }
        this.update()
    }

    getSlotFor(stack, priotizeHotbar = true) {
        const search = o => o?.item.id == stack.item.id && !o.full
        return priotizeHotbar ? this.slots.findIndexFrom(this.hotbarStartIndex, search, true) : this.slots.findIndex(search)
    }

    getEmptySlot(priotizeHotbar = true) {
        return priotizeHotbar ? this.slots.findIndexFrom(this.hotbarStartIndex, o => !o, true) : this.slots.findIndex(o => !o)
    }


    drop(amount = 1){
        if(!this.slot) return false
        
        let toDrop
        if(amount >= this.slot.amount){
            toDrop = this.slot
            this.hotbar[this.selectedSlot] = undefined
        }else{
            toDrop = this.slot.split(amount)
        }
        
        this.updateHotbar()
        return toDrop
    }  
    
    openWith(iface) {
        iface.open(this)
        this.interfaces[iface.html.dataset.interface] = iface
        this.toggle()
    }

    dragStart(e){
        const editedIndex = e.target.dataset.section == 'hotbar' ? Number(e.target.dataset.id) + this.hotbarStartIndex : e.target.dataset.id
        e.dataTransfer.setData("id", editedIndex);
        e.dataTransfer.setData("originSection", e.target.dataset.section);
        e.dataTransfer.setData("originInterface", e.target.parentNode.dataset.interface);
        e.dataTransfer.setData(`dragover:${e.target.parentNode.dataset.interface}:${editedIndex}:${e.target.dataset.section}`, true);
    }

    onDrop(e){
        const data = super.onDrop(e)

        if(data.targetSection == 'hotbar') data.targetID += this.hotbarStartIndex
        
        let originSlots
        const targetSlots = this.slots

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

    allowDrop(e) {
        const [ifaceName, slotID, section] = e.dataTransfer.types.find(t => t.startsWith("dragover"))?.split(":")?.slice(1) ?? []
        if(!ifaceName || ifaceName == e.target.parentNode.dataset.interface) return super.allowDrop(e)
        
        const originInterface = this.interfaces[ifaceName] ?? this
        const originSlots = originInterface instanceof Inventory ? originInterface.slots : originInterface.entity.slots(section)
        const stack = originSlots[Number(slotID)]
        
        let targetSlotID = Number(e.target.dataset.id)

        if(e.target.dataset.section == 'hotbar') targetSlotID += this.hotbarStartIndex

        const curStack = this.slots[targetSlotID]
        !curStack ? super.allowDrop(e) : console.log("Slot already occupied")
    }
}
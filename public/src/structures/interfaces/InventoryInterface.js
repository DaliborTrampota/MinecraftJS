import InterfaceFactory from "./InterfaceFactory.js";
import Interface from "./Interface.js";
import Inventory from "../entities/Inventory.js"
import { GAMEMODE } from "../../tools/Constants.js";


export default class InventoryInterface extends Interface {

    constructor(player){
        super()
        this.player = player

        this.htmlHotbarSlots = new InterfaceFactory.Hotbar(Inventory.HOTBAR_SIZE)
            .build(document.getElementById("hotbar"))
        

        this.interfaces = {}

        //this.background = '/resources/gui/inventory.png'
        
        this.html = new InterfaceFactory(5, 5, 'player-inventory')
            .section(Inventory.COL, Inventory.ROW, 0, 0, 'slots')
            .section(Inventory.HOTBAR_SIZE, 1, 0, Inventory.ROW + 0.25, 'hotbar')
            //.tab('test', 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/7/75/Wheat_JE2_BE2.png', (t) => console.log('clicked tab', t))
            .build(true, this)
    }

    get inv() {
        return this.player.inventory
    }

    get entity() {
        return this.player.inventory
    }
    
    slots(section) {
        const slots = this.inv[section]
        if(!slots) throw new Error(`Invalid inventory section: ${section}`)
        return slots
    }

    selectHotbar(index, oldIdx) {
        let curSlot = this.htmlHotbarSlots[oldIdx]
        let newSlot = this.htmlHotbarSlots[index]

        curSlot.html.id = ""
        newSlot.html.id = "selected"
        
        this.player.updateHandModel(this.inv.slot)
    }

    open(entity) {
        if(entity) {
            const iface = new entity.interfaceClass(entity, this)
            iface.open()
            this.interfaces[iface.name] = iface
            //iface.interfaces[this.name] = this
        } else {
            if(this.player.gamemode === GAMEMODE.CREATIVE) {
                this.interfaces[this.inv.creative.name] = this.inv.creative
                this.inv.creative.open()
            } else if(this.player.gamemode === GAMEMODE.SURVIVAL) {
                this.interfaces[this.inv.crafting.name] = this.inv.crafting
                this.inv.crafting.open()
            }
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
        // for(let i = 0; i < this.htmlSlots.length; ++i) {
        //     let ID = this.htmlSlots[i].dataset.id
        //     let section = this.htmlSlots[i].dataset.section
        //     let stack = this.slots(section)[ID]
        //     stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        // }
        for(let i = 0; i < this.htmlSlots.length; ++i) {
            let stack = this.inv.slots[i]
            stack ? InterfaceFactory.setSlot(this.htmlSlots[i], stack) : InterfaceFactory.clearSlot(this.htmlSlots[i])
        }
        this.updateHotbar()
    }

    updateHotbar() {
        const setSlot = (html, stack) => {
            html.count.innerHTML = stack?.amount ?? ''
            html.image.src = stack?.item.image || InterfaceFactory.Slot.EMPTY
            if(stack?.item.pixelated) html.image.classList.add('pixelated')
            else html.image.classList.remove('pixelated')
            
        }
        for(let i = 0; i < this.inv.hotbar.length; ++i) {
            const html = this.htmlHotbarSlots[i]
            if(!this.inv.hotbar[i]?.amount) this.inv.hotbar[i] = undefined
            setSlot(html, this.inv.hotbar[i])
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
        
        const originInterface = this.interfaces[data.originInterface] ?? this
        const targetSlots = this.slots(data.targetSection)
        const originSlots = originInterface.slots(data.originSection)

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

        const originInterface = this.interfaces[ifaceName] ?? this
        const originSlots = originInterface.slots(section)
        const originStack = originSlots[Number(slotID)]
        

        this.allowDropMergeCheck(e.target.dataset.section, Number(e.target.dataset.id), originStack) 
            ? e.preventDefault() 
            : console.debug("Slot already occupied")
    }
}
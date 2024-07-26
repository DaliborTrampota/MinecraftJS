import CreativeInventoryInterface from "../interfaces/CreativeInterface.js"
import InventoryCrafting from "../interfaces/InventoryCrafting.js"
import InventoryInterface from "../interfaces/InventoryInterface.js"
import InstantRecipe from "../recipes/InstantRecipe.js"
import Recipes from "../registers/Recipes.js"


export default class Inventory extends EventTarget {

    static COL = 10
    static ROW = 4
    static HOTBAR_SIZE = 10

    constructor(player) {
        super()
        this.interface = new CreativeInventoryInterface(player)
        this.crafting = new InventoryCrafting(player, this)

        this.slots = new Array(Inventory.COL * Inventory.ROW + Inventory.HOTBAR_SIZE)
        this.armor = new Array(4)
        this.offhand = new Array(1)
        this.hotbar = this.slots.view(this.slots.length - Inventory.HOTBAR_SIZE, this.slots.length) //view to the hotbar slots in the inventory

        this.inputSlots = new Array(4)
        this.outputSlots = new Array(1)

        this.inputRows = [2, 2]
        this.validRecipes = []
        this.currentRecipe = null
        
        this.selectedSlot = 0
        
        //window.game.addUpdateSub(this)
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

        const oldIdx = this.selectedSlot
        this.selectedSlot = index
        this.interface.selectHotbar(index, oldIdx)
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

            console.debug('Inventory is full')
            break // full or empty stack was added to empty slot
        }
        this.interface.update()
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
        
        this.interface.updateHotbar()
        return toDrop
    } 

    dropCrafting() {

    }

    validateItem(section, _) {
        if(section === 'output') return false
        return true
    }

    
    findRecipes() {
        let acc = 0
        let inputted = this.inputRows.map(len => {
            acc += len
            return [...this.inputSlots.slice(acc - len, acc)]
        })
        this.validRecipes = Recipes.getValid('crafting_table', inputted)
    }
    
    onSlotChange(stack, section, id) {
        if (section == 'input') {
            this.inputChanged()
        } else if(section == 'output') {
            this.outputChanged()
        }
    }


    inputChanged() {
        this.findRecipes()
        console.debug('Found recipes:', this.validRecipes)
        if(this.validRecipes.exact.length) {
            const recipe = this.validRecipes.exact[0]
            if(recipe.time !== -1)
                throw new Error('Recipe is not instant')

            if (this.currentRecipe?.recipe.key != recipe.key)
                this.currentRecipe = new InstantRecipe(recipe, this)

            this.currentRecipe?.update()
        } else if(this.currentRecipe) {
            this.outputSlots = this.outputSlots.map(s => null)
            this.currentRecipe = null
            this.dispatchEvent(new CustomEvent('recipePreview', { detail: false }))
            this.dispatchEvent(new CustomEvent('progress', { detail: 0 }))
        }

    }

    outputChanged() {
        this.currentRecipe.consume()
        this.currentRecipe.output()
        this.currentRecipe.update()
    }
}
import FurnaceInterface from "../../interfaces/FurnaceInterface.js";
import BlockEntity from "../BlockEntity.js";
import Blocks from "../../registers/Blocks.js";
import Recipes from "../../registers/Recipes.js";


export default class FurnaceEntity extends BlockEntity {

    constructor() {
        super(Blocks.FURNACE, FurnaceInterface)

        this.inputSlots = new Array(6)
        this.fuelSlots = new Array(1)
        this.outputSlots = new Array(2)

        this.fuelMap = new Map()
        this.Init()

        this.validRecipes = []
        this.activeRecipe = null
    }

    async Init() {
        super.Init()
        const Items = await import('./../../registers/Items.js').then(r => r.default)

        this.fuelMap.set(Items.OAK_LOG, 200)
    }

    Update(delta) {
        super.Update(delta)

        if(this.activeRecipe) {
            //console.log(this.activeRecipe)
            //this.activeRecipe.update(delta)
        }
    }

    slots(section) {
        return this[`${section}Slots`]
    }

    // openInterface(player) {
    //     const iface = new this.interfaceClass(this)
    //     player.openInterface(iface)
    // }


    validateItem(slot, item) {
        if(slot == 'input')
            return true//this.findRecipe(item)

        if(slot == 'fuel')
            return this.isFuel(item)

        return false
    }

    addStack(slot, stack, index) {
        const slots = this.slots(slot)
        index ??= this.getSlotFor(slots, stack)
        if(index == -1) return stack

        if(slots[index]) slots[index].merge(stack)
        else slots[index] = stack

        return true
    }

    getSlotFor(slots, stack) {
        return slots.findIndex(s => s?.item.id == stack.item.id && !s.full)
    }

    findRecipe() {
        let inputted = [
            [...this.inputSlots.slice(0, 3)],
            [...this.inputSlots.slice(3, 6)],
        ]
        
        this.validRecipes = Recipes.getValid(inputted)
        return this.validRecipes.filter(r => r.validate(inputted, true))
    }

    isFuel(item) {
        return this.fuelMap.has(item)
    }

    
    onSlotChange(stack, section) {
        console.log(stack, section)
        const exactMatches = this.findRecipe()
        console.log(this.validRecipes, exactMatches)   
        if(exactMatches.length > 0) {
            this.activeRecipe = exactMatches[0]
        } else {
            this.activeRecipe = null
        }
        console.log(this.activeRecipe)
    }


}
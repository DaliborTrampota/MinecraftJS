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
    }

    async Init() {
        super.Init()
        const Items = await import('./../../registers/Items.js').then(r => r.default)

        this.fuelMap.set(Items.OAK_LOG, 200)
    }

    Update(delta) {
        
    }

    slots(section) {
        return this[`${section}Slots`]
    }

    openInterface(player) {
        const iface = new this.interfaceClass(this)
        player.openInterface(iface)
    }

    Update(delta) {
        super.Update(delta)
    }


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
        
        const closestIdx = (line) => {
            let idx = line.findIndex(o => o)
            return idx == -1 ? Infinity : idx
        }
        let xIdx = Math.min(...inputted.map(closestIdx))
        let yIdx = Math.min(...transpose(inputted).map(closestIdx))
        inputted = inputted.map(line => line.slice(xIdx))
        inputted = transpose(transpose(inputted).map(line => line.slice(yIdx)))
        console.log(inputted)
        this.validRecipes = Recipes.getValid(inputted)//, this.validRecipes.length ? this.validRecipes : undefined)
        return this.validRecipes.length != 0
    }

    isFuel(item) {
        return this.fuelMap.has(item)
    }

    
    onSlotChange(stack, section) {
        console.log(stack, section)
        console.log(this.findRecipe(), this.validRecipes)   
    }


}

function transpose(matrix) {
    return matrix[0]?.map((col, i) => matrix.map(row => row[i]));
  }
  
import BlockEntity from "./BlockEntity.js"
import Recipes from "../registers/Recipes.js";
import ActiveRecipe from "../recipes/ActiveRecipe.js"
import Stack from "../item/Stack.js"


export default class MachineEntity extends BlockEntity {

    constructor(block, interfaceClass) {
        super(block)
        this.interfaceClass = interfaceClass ?? false
        this.inputSlots = new Array()
        this.outputSlots = new Array()

        this.inputRows = []

        this.validRecipes = []
        this.activeRecipe = null
    }
    
    get hasInterface() {
        return Boolean(this.interfaceClass)
    }

    Update(delta) {
        super.Update(delta)

        if(this.activeRecipe) {
            this.activeRecipe.update(delta)
        }
    }

    getSlotFor(slots, stack) {
        return slots.findIndex(s => s?.item.id == stack.item.id && !s.full)
    }

    findRecipes() {
        let acc = 0
        let inputted = this.inputRows.map(len => {
            acc += len
            return [...this.inputSlots.slice(acc - len, acc)]
        })
        this.validRecipes = Recipes.getValid(this.block.key, inputted)
    }

    onSlotChange(stack, section, id) {
        console.log(section)
        if(section == 'input') {
            this.findRecipes()
            console.log(this.validRecipes)
            if(this.validRecipes.exact.length) {
                this.activeRecipe = new ActiveRecipe(this.validRecipes.exact[0], this)
            }else {
                this.activeRecipe = null
            }
        }
        if(section == 'output') {
            if(this.activeRecipe) {
                this.activeRecipe.active = this.activeRecipe.canOutput()
            }
        }
    }

    
    putToSlots(slots, stacks) {
        stck:
        for(let stack of stacks) {
            let emptyIdx = -1
            for(let i = 0; i < slots.length; i++) {
                if(!slots[i] && emptyIdx == -1) emptyIdx = i
                if(slots[i]?.item == stack.item) {
                    slots[i].merge(stack)
                    continue stck;
                }
            }
            if(emptyIdx == -1) return false
            slots[emptyIdx] = stack
        }
        return true
    }

    hasSpaceForOutput(slots, output) {
        for(let stack of output) {
            let emptyIdx = -1
            for(let i = 0; i < slots.length; i++) {
                if(!slots[i] && emptyIdx == -1) emptyIdx = i
                if(slots[i]?.item == stack.item) {
                    if(slots[i].amount + stack.amount > stack.item.stack) return false
                    continue;
                }
            }
            if(emptyIdx == -1) return false
        }
        return true
    }

}
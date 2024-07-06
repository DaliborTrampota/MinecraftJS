import BlockEntity from "./BlockEntity.js"
import Recipes from "../registers/Recipes.js";

import ActiveRecipe from "../recipes/ActiveRecipe.js"
import InstantRecipe from "../recipes/InstantRecipe.js";

import Stack from "../item/Stack.js"


export default class MachineEntity extends BlockEntity {

    constructor(block, interfaceClass) {
        super(block)
        this.interfaceClass = interfaceClass ?? false
        this.inputSlots = new Array()
        this.outputSlots = new Array()

        this.inputRows = []

        this.validRecipes = []
        this.currentRecipe = null
    }
    
    get hasInterface() {
        return Boolean(this.interfaceClass)
    }


    getSlotFor(slots, stack) {
        return slots.findIndex(s => s?.item.id == stack.item.id && !s.full)
    }

    onSlotChange(stack, section, id) {
        console.log('onSlotChange', section, id)
        if (section == 'input') {
            this.inputChanged()
        } else if(section == 'output') {
            this.outputChanged()
        }
    }


    inputChanged() {
        this.findRecipes()
        console.log(this.validRecipes)
        if(this.validRecipes.exact.length) {
            const recipe = this.validRecipes.exact[0]
            if (this.currentRecipe?.recipe.key != recipe.key)
                this.currentRecipe = recipe.time === -1 ? 
                    new InstantRecipe(recipe, this) :
                    new ActiveRecipe(recipe, this)
        } else if(this.currentRecipe) {
            if(this.currentRecipe.time === -1) {
                this.outputSlots = this.outputSlots.map(s => null)
            }
            this.currentRecipe = null
            this.dispatchEvent(new CustomEvent('recipePreview', { detail: false }))
            this.dispatchEvent(new CustomEvent('progress', { detail: 0 }))
        }

    }

    outputChanged() {
        if(this.currentRecipe.time === -1) {
            this.currentRecipe.consume()
            this.currentRecipe.output()
        } else {
            this.currentRecipe.active = this.currentRecipe.canOutput()
        }
    }

    Update(delta) {
        super.Update(delta)
        this.currentRecipe?.update(delta)
    }


    findRecipes() {
        let acc = 0
        let inputted = this.inputRows.map(len => {
            acc += len
            return [...this.inputSlots.slice(acc - len, acc)]
        })
        this.validRecipes = Recipes.getValid(this.block.key, inputted)
    }

    
    _putToSlots(slots, stacks) {
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

    _hasSpaceForOutput(slots, output) {
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
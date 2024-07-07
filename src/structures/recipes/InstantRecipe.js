import Stack from '../item/Stack.js'

export default class InstantRecipe {

    constructor(recipe, entity) {
        this.recipe = recipe
        this.entity = entity
    }

    get time() {
        return this.recipe.time
    }

    get outputs() {
        let outputs = []
        for(let key in this.recipe.outputs) {
            const amount = this.recipe.outputs[key]
            const stack = Stack.create(key, amount)
            outputs.push(stack)
        }
        return outputs
    }

    update(delta) {
        if(this.canOutput()) this.output()
    }


    canOutput() {
        return this.entity.outputSlots.every(s => !s)
    }

    output() {
        const slots = this.entity.outputSlots
        let outputs = this.outputs
        
        for(let i = 0; i < slots.length; ++i) {
            if(slots[i]) continue
            slots[i] = outputs.shift()
        }
        this.entity.dispatchEvent(new CustomEvent('recipePreview', { detail: true }))
    }

    consume() {
        for(let i = 0; i < this.entity.inputSlots.length; ++i) {
            this.entity.inputSlots[i]?.consume()
            if(!this.entity.inputSlots[i]?.amount) 
                this.entity.inputSlots[i] = undefined
        }
        this.entity.dispatchEvent(new CustomEvent('recipeFinished', { detail: this }))
    }

}
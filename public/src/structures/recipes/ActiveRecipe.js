import Stack from '../item/Stack.js'

export default class ActiveRecipe {

    constructor(recipe, entity) {
        this.recipe = recipe
        this.entity = entity
        this.progress = 0
        this.active = this.canOutput()
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
        if(this.active) {
            this.progress += delta / this.time
            this.entity.dispatchEvent(new CustomEvent('progress', { detail: this }))

            if(this.progress >= 1) {
                this.output()
                this.consume()
                this.entity.dispatchEvent(new CustomEvent('recipeFinished', { detail: this }))
                this.progress = 0
                this.entity.onSlotChange(null, "input", null)
                this.active = this.canOutput()
            }
        }
    }

    canOutput() {
        const slots = this.entity.outputSlots
        let outputs = this.outputs
        
        outputs = outputs.filter(stack => {
            const slot = slots.find(s => s?.item && s.item.id == stack.item.id && !s.full)
            if(!slot) return true
            return slot.amount + stack.amount > slot.item.stack
        })
        const emptySlots = slots.length - slots.filter(s => s).length
        if(emptySlots >= outputs.length) return true
        return false
    }

    output() {
        const slots = this.entity.outputSlots
        let outputs = this.outputs
        
        outputs = outputs.filter(stack => {
            const slot = slots.find(s => s?.item && s.item.id == stack.item.id && !s.full)
            if(!slot) return true
            return slot.merge(stack) instanceof Stack
        })

        for(let i = 0; i < slots.length; ++i) {
            if(slots[i]) continue
            slots[i] = outputs.shift()
        }
    }

    consume() {
        for(let i = 0; i < this.entity.inputSlots.length; ++i) {
            this.entity.inputSlots[i]?.consume()
            if(!this.entity.inputSlots[i]?.amount) 
                this.entity.inputSlots[i] = undefined
        }
    }

}
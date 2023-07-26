

export default class AbstractRecipe {

    constructor(key, inputs, outputs, time, shapeless, machine) {
        this.key = key
        this.inputs = inputs
        this.outputs = outputs
        this.time = time
        this.shapeless = shapeless
        this.machine = machine
    }

    get width() {
        if(this.shapeless) return 1
        return this.inputs[0].length
    }

    get height() {
        if(this.shapeless) return 1
        return this.inputs.length
    }

    validate(inputted) {
        if(this.shapeless) {
            inputted = inputted.flat().filter(o => o)
            for(let itemName of this.inputs) {
                let idx = inputted.findIndex(s => s.item.key == itemName)
                if(idx == -1) return false
                inputted.splice(idx, 1)
            }
            if(inputted.length > 0) return false
            return true
        }
        let matched = this.inputs.every((line, y) => {
            return line.every((item, x) => {
                console.log(item, y, x, inputted[y][x])
                let valid = item == inputted[y][x]?.item.key
                inputted[y][x] = null
                return valid
            })
        })
        console.log(inputted, 'after', matched)
        return matched && inputted.some(i => i != null)
    }

    partiallyValidate(inputted) {
        if(this.shapeless) {
            inputted = inputted.flat().filter(o => o)
            const inputCopy = [...this.inputs]
            for(let stack of inputted) {
                let idx = inputCopy.findIndex(item => item == stack.item.key)
                if(idx == -1) return false
                inputCopy.splice(idx, 1)
            }
            return true
        }
        const inputCopy = this.inputs.map(line => [...line])
        let matched = inputted.every((line, y) => {
            return line.every((stack, x) => {
                let valid = stack?.item.key == inputCopy[y][x]
                inputCopy[y][x] = null
                return valid
            })
        })
        return matched
    }



    static fromJSON(key, json) {
        console.log(key, json)
        let inputs = json.input.map(line => line.split('').map(x => json.ingredients[x] ?? null))
        if(json.shapeless) inputs = inputs.flat()
        else inputs = inputs.map(line => line.map(x => x))

        const recipe = new AbstractRecipe(key, inputs, json.output, json.time, json.shapeless, json.machine)
        return recipe
    }
}
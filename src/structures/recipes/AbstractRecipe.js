

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
        return Math.max(...this.inputs.map(l => l.length))//this.inputs[0].length
    }

    get height() {
        if(this.shapeless) return 1
        return this.inputs.length
    }

    validate(inputted, strict = true) {
        if(this.shapeless) {
            inputted = inputted.flat().filter(o => o)
            if(strict && inputted.length != this.inputs.length) return false

            const inputCopy = [...this.inputs]
            for(let stack of inputted) {
                let idx = inputCopy.findIndex(item => item == stack.item.key)
                if(idx == -1) return false
                inputCopy.splice(idx, 1)
            }
            return true
        }


        const inputCopy = this.inputs.map(line => [...line])

        const xOffsetMax =  Math.max(...inputted.map(l => l.length)) - this.width
        const yOffsetMax = inputted.length - this.height
        
        for(let yOffset = 0; yOffset <= yOffsetMax; yOffset++) {
            for(let xOffset = 0; xOffset <= xOffsetMax; xOffset++) {

                for(let y = 0; y < inputted.length; y++) {
                    for(let x = 0; x < inputted[y].length; x++) {
                        const requiredStack = inputCopy[y + yOffset][x + xOffset]
                        if(requiredStack == inputted[y][x]?.item.key) 
                            continue
                        if(!strict && inputted[y][x] == null && requiredStack) 
                            continue
                        return false
                    }
                }
            }
        }
        return true
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
import Register from "./registers/RegisterManager.js"
import Stack from "./item/Stack.js"


export default class LootTable {

    constructor(name, context){
        this.data = Register.lootTables[name]
        this.name = name
        this.context = context
    }

    roll(){
        if(!this.data) {
            console.warn('Missing loot table for', this.name)
            return []
        }
        let result = []

        for(let pool of this.data.pools){
            for(let i = 0; i < pool.items; ++i){
                let drop = this.getRandom(pool.drops)
                if(drop) result.push(drop)
            }
        }

        return result.map(r => this.dropToStack(r))
    }

    dropToStack(drop){
        if(drop.type == 'item') 
            return Stack.create(drop.name, drop.amount ?? 1)

    }

    getRandom(drops){
        let validDrops = drops.filter(d => d.conditions ? this.validate(d) : true)
        if(validDrops.length == 1) return validDrops[0]
        return validDrops.at(Math.random() * validDrops.length)
    }

    validate(drop){
        let valid = true
        let idx = 0
        while(valid){
            valid = this.validateCondition(drop.conditions[idx])
            idx++
        }
        return valid
    }

    validateCondition({condition}){
        switch(condition){
            case 'match_tool':
                return false //this.context.slotItem =  
        }
        return false
    }
}
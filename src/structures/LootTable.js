import Register from "../Register.js"
import Stack from "./Interfaces/Stack.js"


export default class LootTable {

    constructor(name, register){
        this.data = Register.lootTables[name]
        this.register = register
        this.name = name
    }

    roll(){
        if(!this.data) {
            console.warn('Missing loot table for', this.name)
            return []
        }
        let result = []

        for(let pool of this.data.pools){
            for(let i = 0; i < pool.items; ++i){
                result.push(this.getRandom(pool.drops))
            }
        }

        return result.map(r => this.dropToStack(r))
    }

    dropToStack(drop){
        //console.log(drop)
        if(drop.type == 'item') return new Stack(this.register.getItem(drop.name), drop.amount ?? 1)

    }

    getRandom(drops){
        let validDrops = drops.filter(d => this.validate(d))
        if(validDrops.length == 1) return validDrops[0]
        return validDrops.at(Math.random() * validDrops.length)
    }

    validate(drop){
        return true
    }
}
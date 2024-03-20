import AbstractRegister from "./AbstractRegister.js";
import MobBuilder from "../entities/MobBuilder.js";
import BaseAI from "../entities/ai/BaseAI.js";
import SlimeAI from "../entities/ai/SlimeAI.js";

export default class Entities extends AbstractRegister {

    constructor() {
        super()
    }

    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
            this.init()
        }
        return this.INSTANCE
    }

    static register(entity) {
        if(!(entity instanceof MobBuilder)) {
            console.error("Item must be an instance of Item", entity)
            return this
        }
        //item.setData(data)
        entity.id = Entities.ID
        Entities.new().map.set(Entities.ID, entity.key)
        Entities.ID++
        return entity
    }

    static init() {
        this.COW = this.register(new MobBuilder('cow'))
        this.SLIME = this.register(new MobBuilder('slime').setAI(SlimeAI))
    }

    
    generateModels() {
        for(let key of this.map.values()) {
            const entity = Entities[key.toUpperCase()]
            entity.generateModel()
        }
    }
}
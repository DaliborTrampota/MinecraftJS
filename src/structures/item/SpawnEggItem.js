import MobEntity from "../entities/MobEntity";
import Item from "./Item";


export default class SpawnEggItem extends Item {

    constructor(key, entity) {
        super(key)

        this.entity = entity
    }


    use(context) {
        const entity = new MobEntity(this.entity)
        entity.position.set(context.position.x, context.position.y + 0.25, context.position.z)
        context.world.setEntityAt(entity.position, entity)
    }
}
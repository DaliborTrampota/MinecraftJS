import { Sprite, SpriteMaterial } from "three"
import TextureManager from "../../tools/TextureManager"


export default class Item {

    constructor(key){
        this.key = key

        this.image = `/resources/textures/items/${key}.png`
        this.pixelated = true
        this.stack = 64
        this.tab = "DEFAULT"
        this.damage = 0
    }

    getModel(position) {
        const texture = TextureManager.items.get(this.key)
        if(!texture)
            return console.warn("implement item models")
        const sprite = new Sprite(new SpriteMaterial({ map: texture, depthTest: false }))
        sprite.name = "block"
        sprite.position.copy(position)
        return sprite
    }
 
    setStack(amount){
        this.stack = amount
        return this
    }

    setTab(tab){
        this.tab = tab
        return this
    }

    setDamage(damage){
        this.damage = 0
        return this
    }

    use() {
        console.warn('action not implemented for item', this.key)
    }

    breakBlock(){
        return false
    }

    hurt(){
        return false
    }

    place(){
        return false
    }
}
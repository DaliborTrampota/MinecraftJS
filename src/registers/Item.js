

export default class Item {

    constructor(name){
        this.name = name

        this.image = `/src/resources/textures/blocks/${name}.png`//"https://raw.githubusercontent.com/ZtechNetwork/MCBVanillaResourcePack/master/textures/items/wheat.png"
        this.pixelated = true
        this.stack = 64
        this.tab = "DEFAULT"
        this.damage = 0
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
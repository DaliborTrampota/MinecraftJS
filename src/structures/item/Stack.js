import { GAME_SETTINGS } from "../../tools/Constants.js"
import Items from "../registers/Items.js"


export default class Stack {

    constructor(item, amount){
        this.item = item
        this.amount = amount
    }

    get full(){
        return this.amount >= this.item.stack
    }

    static create(itemName, amount) {
        const item = Items.get(itemName)
        return new Stack(item, amount)
    }

    //todo merge 
    merge(stack){
        if(this.item.id != stack.item.id) return false

        if(this.amount + stack.amount > GAME_SETTINGS.maxItems){
            stack.amount -= GAME_SETTINGS.maxItems - this.amount
            this.amount = GAME_SETTINGS.maxItems
            return stack
        }else{
            this.amount += stack.amount
            stack.amount = 0
            return true
        }
    }

    split(amount){
        if(amount){
            if(amount > this.amount) return this
            this.amount -= amount
            return new Stack(this.item, amount)
        }else{
            let amount = Math.round(this.amount / 2)
            this.amount -= amount
            return new Stack(this.item, amount)
        }
    }

    consume(amount = 1) {
        this.amount -= amount
        if(!this.amount) return null
        return this
    }
}
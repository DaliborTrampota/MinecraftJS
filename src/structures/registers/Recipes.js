import AbstractRegister from "./AbstractRegister.js";
import AbstractRecipe from "../recipes/AbstractRecipe.js";
import Blocks from "./Blocks.js";

export default class Recipes extends AbstractRegister {

    constructor() {
        super()
        this.recipes = []
    }

    load() {
        for(let recipeName in window.recipeData) {
            let recipe = AbstractRecipe.fromJSON(recipeName, window.recipeData[recipeName])
            switch(window.recipeData[recipeName].machine) {
                case 'furnace':
                    recipe.machine = Blocks.FURNACE
                    break

                default:
                    console.error("Unknown machine", window.recipeData[recipeName].machine)
                    recipe.machine = "CRAFTING"
                    break
            }
            Recipes.register(recipe)
        }
    }

    static new() {
        if(!this.INSTANCE) {
            this.INSTANCE = new this()
            this.INSTANCE.load()
        }
        return this.INSTANCE
    }

    static register(recipe) {
        recipe.id = Recipes.ID
        // Recipes.new().map.set(Recipes.ID, recipe)
        // Recipes.new().map.set(recipe.key, Recipes.ID)
        Recipes.new().recipes.push(recipe)
        Recipes.ID++
        return recipe
    }

    static get(key) {
        if(key == null || key == undefined) {
            console.error('No key provided')
            return null
        }
        if(typeof key == 'object') 
            console.error('not a string or number', key)

        return Recipes.new().recipes.find(r => r.key == key || r.id == key)
    }

    static getID(key) {
        return this.get(key)?.id ?? -1
    }

    static getValid(inputted, recipes = Recipes.new().recipes) {
        return recipes.filter(r => r.validate(inputted, false))
    }
}
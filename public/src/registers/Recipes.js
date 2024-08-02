import AbstractRegister from "./AbstractRegister.js";
import AbstractRecipe from "../recipes/AbstractRecipe.js";
import Blocks from "./Blocks.js";
import ResourceManager from "../tools/ResourceManager.js";

export default class Recipes extends AbstractRegister {

    constructor() {
        super()
        this.recipes = []
    }

    load() {
        for(let recipeName in ResourceManager.data.recipes) {
            let recipe = AbstractRecipe.fromJSON(recipeName, ResourceManager.data.recipes[recipeName])
            // switch(window.recipeData[recipeName].machine) {
            //     case 'furnace':
            //         recipe.machine = Blocks.FURNACE
            //         break

            //     default:
            //         console.error("Unknown machine", window.recipeData[recipeName].machine)
            //         recipe.machine = "CRAFTING"
            //         break
            // }
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

    static getValid(machineKey, inputted, recipePool = Recipes.new().recipes) {
        const exact = []
        const recipes = []
        
        for(let recipe of recipePool) {
            if(recipe.machine == machineKey) {
                const valid = recipe.validate(inputted)
                if(valid.exact) exact.push(recipe)
                if(valid.partial) recipes.push(recipe)
            }
        }
        return { exact, recipes }
    }
}

import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { Ingredient } from "../shared/ingredient.model";
import { ShoppingListService } from "../shopping-list/shopping-list.service";
import { Recipe } from "./recipe.model";

@Injectable()
export class RecipeService{
    recipesChanged = new Subject<Recipe[]>();

    /** Recipe(name:string, desc:string, imagePath:string, ingredients:Ingredients[])*/
    /** https://thewoksoflife.com/sichuan-spicy-wontons/ */
    // private recipes: Recipe[] =[
    //     new Recipe(
    //         'SICHUAN SPICY WONTONS', 
    //         'Sweet, savory, garlicky, and not as spicy as they look, Sichuan spicy wontons', 
    //         'https://thewoksoflife.com/wp-content/uploads/2015/09/spicy-wontons-2.jpg',
    //         [
    //             new Ingredient('Ground Pork', 6),
    //             new Ingredient('Wonton wrappers', 18),
    //         ]),
    //     new Recipe(
    //         'Big Fat Burger', 
    //         'What else do you need to say?', 
    //         'https://www.recipetineats.com/wp-content/uploads/2016/02/Beef-Hamburgers_7-2.jpg',
    //         [
    //             new Ingredient('Buns', 2),
    //             new Ingredient('Meat', 1),
    //         ])
    // ];
    private recipes: Recipe[] = [];

    constructor(private slService: ShoppingListService){}

    setRecipes(recipes: Recipe[]){
        this.recipes = recipes;
        this.recipesChanged.next(this.recipes.slice());
    }

    getRecipes(){
        return this.recipes.slice();
    }

    getRecipe(index: number){
        return this.recipes[index];
    }

    addIngredientsToShoppingList(ingredients: Ingredient[]){
        this.slService.addIngredients(ingredients);
    }

    addRecipe(recipe:Recipe){
        this.recipes.push(recipe);
        this.recipesChanged.next(this.recipes.slice());
    }

    updateRecipe(index:number, newRecipe:Recipe){
        this.recipes[index] = newRecipe;
        this.recipesChanged.next(this.recipes.slice());
    }

    deleteRecipe(index:number){
        this.recipes.splice(index,1);
        this.recipesChanged.next(this.recipes.slice());
    }
}
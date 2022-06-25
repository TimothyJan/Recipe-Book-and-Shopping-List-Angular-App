import { Directive, ViewContainerRef } from "@angular/core";

@Directive({
    selector: '[appPlaceholder]'
})
export class PlaceholderDirective{
    
    /** viewContainerRef gives access to reference/pointer at the place where this directive is used. 
     * public sowecan access viewContainer from outside
    */
    constructor(public viewContainerRef: ViewContainerRef){}

}
import { Component, ComponentFactoryResolver, OnDestroy, ViewChild } from "@angular/core";
import { NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { AlertComponent } from "../shared/alert/alert.component";
import { PlaceholderDirective } from "../shared/placeholder/placeholder.directive";
import { AuthResponseData, AuthService } from "./auth.service";

@Component({
    selector:'app-auth',
    templateUrl: './auth.component.html'
})
export class AuthComponent implements OnDestroy{
    isLoginMode = true;
    isLoading = false;
    error:string = null;

    /** Show alert programmatically 
     * ViewChild looks for first place we use the placeholder directive
    */
    @ViewChild(PlaceholderDirective, {static:false}) alertHost: PlaceholderDirective;

    private closeSub: Subscription;

    constructor(
        private authService: AuthService, 
        private router: Router,
        private componentFactoryResolver: ComponentFactoryResolver
    ){}

    onSwitchMode(){
        this.isLoginMode = !this.isLoginMode;
    }

    onSubmit(form: NgForm){
        // checks valid form, aready have check in html code
        if (!form.valid){
            return;
        }

        const email = form.value.email;
        const password = form.value.password;

        let authObs: Observable<AuthResponseData>;

        this.isLoading = true;
        if (this.isLoginMode){
            authObs = this.authService.login(email, password);
        } else{
            authObs = this.authService.signup(email, password);
        }

        authObs.subscribe( 
            resData => {
                console.log(resData);
                this.isLoading = false;
                this.router.navigate(['/recipes']);
            },
            errorMessage => {
                console.log(errorMessage);
                // Don't need anymore with showErrorAlert
                this.error = errorMessage;
                // using showErrorAlert
                this.showErrorAlert(errorMessage);
                this.isLoading = false;
            }
        );

        form.reset();
    }

    // With dynamic alert component using *ngIf
    onHandleError(){
        this.error = null;
    }

    ngOnDestroy(): void {
        if(this.closeSub){
            this.closeSub.unsubscribe();
        }
    }

    /** Show alert programmatically from inside code
     * Need to use ComponentFactoryResolver to have access to Component Factory
    */
    private showErrorAlert(message: string){
        const alertCmpFactory = this.componentFactoryResolver.resolveComponentFactory(
            AlertComponent
        );
     const hostViewContinerRef = this.alertHost.viewContainerRef;
     // Clears all angular components that have been rendered before rendering something new
     hostViewContinerRef.clear();

     // Using component factory to create new alert component in view container reference
     const componentRef = hostViewContinerRef.createComponent(alertCmpFactory);

     // Ensures alert message is displayed
     componentRef.instance.message = message;
     // Ensures angular can listen to close event for alert
     this.closeSub = componentRef.instance.close.subscribe(() => {
        this.closeSub.unsubscribe();
        hostViewContinerRef.clear();
     });
    }
}
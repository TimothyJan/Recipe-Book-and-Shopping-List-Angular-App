import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map, take } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable({providedIn: 'root'})
// @Injectable()
export class AuthGuard implements CanActivate {

    constructor(private authService:AuthService,private router: Router){}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
        /** protects just typing in '/recipe' route if unauthenticated */
        /** using take(1) to take latest user value and no ongoing subscription */
        return this.authService.user.pipe(
            take(1),
            map(user => 
                {
                    const isAuth =  !!user;
                    if(isAuth){
                        return true;
                    }
                    // redirects to /auth
                    return this.router.createUrlTree(['/auth']);
                }
            )
        );
    }
}
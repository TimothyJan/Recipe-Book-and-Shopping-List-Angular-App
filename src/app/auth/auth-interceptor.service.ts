import { HttpHandler, HttpInterceptor, HttpParams, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { take, exhaustMap } from "rxjs/operators";
import { AuthService } from "./auth.service";

@Injectable()
export class AuthInterceptorService implements HttpInterceptor{

    constructor(private authService: AuthService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler) {
        /** take tells RxJS we only want 1 value from observable 
         * take gets first emission
        */
        /** exhaustMap waits for first observable to complete which happens after we take the latest user.
         * we get data from the previous observable and return a new observable which replaces our prevous observable.
         */
        return this.authService.user
            .pipe(
                take(1),
                exhaustMap( user => {
                    // if no user, proceed with request as normal
                    if(!user){
                        return next.handle(req);
                    }
                    // Only check for token if we have a user
                    const modifiedReq = req.clone({
                        params: new HttpParams().set('auth', user.token)
                    });
                    return next.handle(modifiedReq);
                })
            );
    }
}
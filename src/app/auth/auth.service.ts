import { HttpClient, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { BehaviorSubject, Subject, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { User } from "./user.model";
import { environment } from "src/environments/environment";

// defines how our response data will look like 
export interface AuthResponseData{
    idToken: string;
    email: string;
    refreshToken: string;
    expiresIn: string;
    localId: string;
    registered?: boolean;     
}

@Injectable({providedIn: 'root'})
// @Injectable()
export class AuthService{
    /** A BehaviorSubject holds one value. When it is subscribed it 
     * emits the value immediately. A Subject doesn't hold a value. */
    user = new BehaviorSubject<User>(null);
    private tokenExpirationTimer: any;

    constructor(private http: HttpClient, private router: Router){}

    signup(email:string, password:string){
        return this.http.post<AuthResponseData>(
            'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=' + environment.firebaseAPIKey,
            {
                email: email,
                password: password,
                returnSecureToken: true
            }
        ).pipe(
            catchError(this.handleError),
            tap(resData => {
                this.handleAuthentication(
                    resData.email,
                    resData.localId,
                    resData.idToken,
                    +resData.expiresIn
                );
            })
        );
    }

    login(email:string, password:string){
        return this.http
            .post<AuthResponseData>(
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' + environment.firebaseAPIKey,
                {
                    email: email,
                    password: password,
                    returnSecureToken: true
                }
            )
            .pipe(
                catchError(this.handleError),
                tap(resData => {
                    this.handleAuthentication(
                        resData.email,
                        resData.localId,
                        resData.idToken,
                        +resData.expiresIn
                    );
                })
            );
    }

    autoLogin(){
        /** Retrieve user data from local storage 
         * we stored userData as string in handleAuthentication()
         * need to convert back to JSON
        */
        const userData:{
            email: string,
            id: string,
            _token: string,
            _tokenExpirationDate: string
        } = JSON.parse(localStorage.getItem('userData'));
        if (!userData){
            return;
        } 

        const loadedUser = new User(
            userData.email,
            userData.id,
            userData._token,
            new Date(userData._tokenExpirationDate)
        );

        // token returns null if not valid token in user.model.ts
        if (loadedUser.token){
            this.user.next(loadedUser);
            // future date - current data = duration until token expires
            const expirationDuration = new Date(userData._tokenExpirationDate).getTime() - new Date().getTime();
            this.autoLogout(expirationDuration);
        }
    }

    logout(){
        /** Set user state to null, app treats user as unauthenticated */
        this.user.next(null);
        this.router.navigate(['/auth']);
        /** just removing 'userData' instead of all items with localStorage.clear() */
        localStorage.removeItem('userData');

        /** Clear tokenExpirationTime when we log out */
        if(this.tokenExpirationTimer){
            clearTimeout(this.tokenExpirationTimer);
        }
        this.tokenExpirationTimer = null;
    }

    autoLogout(expirationDuration: number){
        /** Set tokenExpiratioTimer */
        this.tokenExpirationTimer = setTimeout(() => {
            this.logout();
        }, expirationDuration);
    }

    private handleAuthentication(email:string, userId:string, token:string, expiresIn:number){
        const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
        );
        const user = new User(
            email,
            userId,
            token,
            expirationDate
        );
        this.user.next(user);

        /** Expect milliseconds in autoLogout */
        this.autoLogout(expiresIn * 1000);

        /** Keep the authentication token even when browser reloads */
        /** stringify converts Javascript object to a string version */
        /** Inspect -> Application -> Local Storage to see saved storage data */
        localStorage.setItem('userData', JSON.stringify(user));
    }

    private handleError(errorRes:HttpErrorResponse){
        let errorMessage = 'An unknown error occurred!';
        if (!errorRes.error || !errorRes.error.error){
            return throwError(errorMessage);
        }
        switch(errorRes.error.error.message){
            case 'EMAIL_EXISTS':
                errorMessage = 'This email exists already.';
                break;
            case 'EMAIL_NOT_FOUND':
                errorMessage = 'This email does not exist.';
                break;
            case 'INVALID_PASSWORD':
                errorMessage = 'The password is invalid.';
                break;
        }
        return throwError(errorMessage);
    }
}
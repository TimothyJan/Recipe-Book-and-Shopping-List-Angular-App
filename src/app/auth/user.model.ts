
/** Model stores all the core data
 * Check if token exists and is still valid
 */

export class User{
    constructor(
        public email: string,
        public id: string,
        private _token: string,
        private _tokenExpirationDate: Date
    ) {}

    get token(){
        /** getter is a property were you can write code that runs when you try to access this property
         * User cannot overwrite this
        */
       if(!this._tokenExpirationDate || new Date() > this._tokenExpirationDate){
        return null;
       }
        return this._token;
    }
}
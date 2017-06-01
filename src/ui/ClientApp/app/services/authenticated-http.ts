import { Observable } from 'rxjs/Rx';
import { UserService } from './user.service';
import { Http, RequestOptionsArgs, Response, Headers, ConnectionBackend, RequestOptions, Request } from '@angular/http';
import { Router } from "@angular/router";

export class AuthenticatedHttp extends Http {
    
    constructor(private userService: UserService, private router: Router, backend: ConnectionBackend, defaultOptions: RequestOptions) {
        super(backend, defaultOptions);
    }

    request(url: string | Request, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.request(url, options));
    }

    get(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.get(url, options));
    }

    post(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.post(url, body, options));
    }

    put(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.put(url, body, options));
    }

    patch(url: string, body: any, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.patch(url, body, options));
    }

    delete(url: string, options?: RequestOptionsArgs): Observable<Response> {
        this.appendAuthHeader(options);
        return this.rerouteUnauthorized(super.delete(url, options));
    }
    
    private appendAuthHeader(options?: RequestOptionsArgs): RequestOptionsArgs  {
        var token = this.userService.currentUser.lousySecurityKey;
        if (options) {
            if (options.headers && !options.headers['Authorization']) {
            } else {
                options.headers = new Headers();
            }
            options.headers.append('Authorization', `lousysecurity ${token}`);
            return options;
        } else {
            let headers = new Headers({
                'Authorization': `lousysecurity ${token}`
            });
            return {
                headers: headers
            };
        }
    }

    private rerouteUnauthorized(observable: Observable<Response>): Observable<Response> {
        return observable.catch((r: Response, c) => {
            if(r.status === 401) {
                this.router.navigate(['/register']);
            }
            return Observable.throw(r);
        });
    }
}

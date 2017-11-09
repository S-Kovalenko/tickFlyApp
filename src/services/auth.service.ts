import { Injectable } from '@angular/core';
//import { Router } from '@angular/router';
import 'rxjs/add/operator/filter';
import * as auth0 from 'auth0-js';
import {Http, Headers, Response, RequestOptions} from "@angular/http";
import 'rxjs/add/operator/map';
import 'rxjs/Rx';

@Injectable()
export class AuthService {

  // auth0 = new auth0.WebAuth({
  //   clientID: 'vFEhteNfA7RsmLqu6d1MOv5yK66njgg6',
  //   domain: 'app-dev.eu.auth0.com',
  //   responseType: 'token id_token',
  //   audience: 'https:/API = "http://localhost:8080";/app-dev.eu.auth0.com/userinfo',
  //   redirectUri: 'http://localhost:8080/callback',
  //   scope: 'openid'
  // });

  API = "http://localhost:8080";

  constructor(private http: Http) {}

  createAuthorizationHeader(headers: Headers) {
    headers.append('Authorization', 'Bearer ' +
      this.getToken());
  }

  signup(email: string, password: string) {
    return this.http.post(`http://localhost:8080/api/sign-up`,
      {email: email, password: password},
      {headers: new Headers({"X-Requested-With": "XMLHttpRequest"})})
      .map(
        (response: Response) => {
          const token = response.json().access_token;
          const base64Url = token.split(".")[1];
          const base64 = base64Url.replace("-", "+").replace("_", "/");
          console.log(JSON.parse(window.atob(base64)));
          return {
            token: token,
            decoded: JSON.parse(window.atob(base64))
          };
        }
      )
      .do(
        tokenData => {
          localStorage.setItem("token", tokenData.token);
        }
      );
  }

  logout() {
    localStorage.removeItem("token");
  }

  getToken() {
    return localStorage.getItem("token");
  }

  isLogin(): boolean {
    if (this.getToken()) {
      // console.log('logged true');
      // console.log(this.getToken());
      return true;
    }
  }

  // signupFacebook(email: string, password: string) {
  //   return this.http.post(`${this.API}\api\facebook\authorize`)
  //     .subscribe();
  // }

  signinGoogle() {
    // this.auth.login('google').then( (success) => {
    //   console.log();
    // } );
    console.log('testss');
    return this.http.get('http://localhost:8080/api/google/authorize').subscribe(
      response => {
        console.log(response);
        console.log('Success');
      },
      error => {
        console.log('Error');
      }
    );
  }

  // signin(email: string, password: string) {
  //   return this.http.post( `${this.API}\api\signin',
  //     {email: email, password: password})
  //     .subscribe();
  // }

}

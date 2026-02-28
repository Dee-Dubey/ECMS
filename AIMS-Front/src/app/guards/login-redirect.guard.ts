import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { PostLoginRedirectService } from '../services/post-login-redirect.service';
import { DatabaseService } from '../services/database.service';
import { filter, firstValueFrom, take } from 'rxjs';
import { SessionstorageService } from '../services/sessionstorage.service';

@Injectable({ providedIn: 'root' })
export class LoginRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private postLoginRedirect: PostLoginRedirectService,
    private db: DatabaseService, // optional: to validate token server-side
    private authCtx: SessionstorageService
  ) { }

  async canActivate(): Promise<boolean | UrlTree> {
    const token = sessionStorage.getItem('auth-token');
    if (!token) return true; // not logged in — allow login page

    await firstValueFrom(
      this.authCtx.ready$.pipe(filter(r => r === true), take(1))
    );

    return this.router.parseUrl(
      this.postLoginRedirect.redirectUser()
    );

  }
}

import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class AuthGuardService implements CanActivate {

  constructor(
    public authService: AuthService,
    public router: Router
  ) { }

  async canActivate() {
    const notAuthenticated = !await this.authService.isAuthenticated();
    if (notAuthenticated) {
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }
}

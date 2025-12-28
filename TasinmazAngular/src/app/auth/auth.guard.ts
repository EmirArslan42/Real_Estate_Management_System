import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService:AuthService,private router:Router){

  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    // Login değilse → login
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    if(state.url.startsWith('/dashboard/admin')){
      if(!this.authService.isAdmin()){
        this.router.navigate(['/dashboard/tasinmaz/list']);
        return false;
      }
    }

    if(state.url.startsWith('/dashboard/tasinmaz/add') || state.url.startsWith('/dashboard/tasinmaz/edit')){
      if(this.authService.isAdmin()){
        this.router.navigate(['/dashboard/tasinmaz/list']);
        return false;
      }
    }

    if(state.url.startsWith('/dashboard/hesaplama/alan-hesabi')){
      if(this.authService.isAdmin()){
        this.router.navigate(['/dashboard/tasinmaz/list']);
        return false;
      }
    }

    return true;
  }
  
}

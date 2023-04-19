import { Component } from '@angular/core';
import { PocketbaseService } from '../../services/pocketbase.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
})
export class NavigationComponent {
  constructor(private pb: PocketbaseService, private router: Router) {}

  authenticated$ = this.pb.isAuthenticated();

  signout() {
    this.router.navigate(['auth', 'signout']);
  }

  signin() {
    this.router.navigate(['auth', 'signin']);
  }

  home() {
    this.router.navigate(['']);
  }
}

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { SpotifyService } from 'src/app/shared/services/spotify.service';

@Component({
  selector: 'app-signout',
  templateUrl: './signout.component.html',
})
export class SignoutComponent {
  constructor(
    private pb: PocketbaseService,
    private spotifyService: SpotifyService,
    private router: Router
  ) {
    this.pb.signOut();
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['auth', 'signin']);
  }
}

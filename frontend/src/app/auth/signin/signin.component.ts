import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { CryptoService } from 'src/app/shared/services/crypto.service';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';

@UntilDestroy()
@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  host: {
    class: 'block h-screen',
  },
})
export class SigninComponent {
  constructor(
    private pb: PocketbaseService,
    private cryptoService: CryptoService,
    private router: Router
  ) {
    this.pb
      .isAuthenticated()
      .pipe(untilDestroyed(this))
      .subscribe((a) => {
        if (a) {
          router.navigate(['/']);
        }
      });
  }

  async signin() {
    const codeVerifier = this.cryptoService.RandomString(128);
    await this.cryptoService
      .GenerateCodeChallenge(codeVerifier)
      .then((codeChallenge) => {
        const state = this.cryptoService.RandomString(16);
        const scope = 'user-read-private user-read-email';

        localStorage.setItem('code_verifier', codeVerifier);
        const args = new URLSearchParams({
          response_type: 'code',
          client_id: '6160bd350ff14394a537ac0cddf0c12e',
          scope: scope,
          redirect_uri: window.location.origin + '/auth/callback',
          state: state,
          code_challenge_method: 'S256',
          code_challenge: codeChallenge,
        });

        window.location.href = 'https://accounts.spotify.com/authorize?' + args;
      });
  }
}

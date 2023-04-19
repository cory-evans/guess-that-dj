import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';

@UntilDestroy()
@Component({
  selector: 'app-callback',
  templateUrl: './callback.component.html',
})
export class CallbackComponent {
  constructor(
    private activeRoute: ActivatedRoute,
    private pb: PocketbaseService,
    private router: Router
  ) {
    this.activeRoute.queryParams
      .pipe(untilDestroyed(this))
      .subscribe((params) => {
        const code_verifier = localStorage.getItem('code_verifier') || '';

        this.pb.signIn(params['code'], code_verifier).then(() => {
          this.router.navigate(['/']);
        });
      });
  }
}

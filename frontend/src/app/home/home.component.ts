import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { PocketbaseService } from '../shared/services/pocketbase.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  host: {
    class: 'h-screen block',
  },
})
export class HomeComponent {
  user$ = this.pb.CurrentUser().pipe(untilDestroyed(this));
  authenticated$ = this.pb.isAuthenticated().pipe(untilDestroyed(this));

  constructor(private router: Router, private pb: PocketbaseService) {}
}

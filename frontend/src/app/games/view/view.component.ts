import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  distinctUntilKeyChanged,
  map,
  filter,
  switchMap,
  shareReplay,
} from 'rxjs';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { Game } from '../games.models';

@UntilDestroy()
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
})
export class ViewComponent {
  constructor(
    private pb: PocketbaseService,
    private activeRoute: ActivatedRoute
  ) {}

  private _routeParams = this.activeRoute.params.pipe(untilDestroyed(this));
  gameId$ = this._routeParams.pipe(
    distinctUntilKeyChanged('id'),
    map((params) => params['id']),
    filter((id) => !!id)
  );

  game$ = this.gameId$.pipe(
    switchMap((id) => this.pb.trackObject<Game>('games', id)),
    untilDestroyed(this),
    shareReplay(1)
  );

  gameState$ = this.game$.pipe(map((g) => g?.state.split('/')));
}

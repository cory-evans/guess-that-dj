import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  distinctUntilKeyChanged,
  map,
  filter,
  switchMap,
  shareReplay,
  Subject,
  withLatestFrom,
  tap,
  from,
  of,
} from 'rxjs';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { Game } from '../../shared/models/games.models';

@UntilDestroy()
@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
  host: {
    class: 'flex-1 flex flex-col',
  },
})
export class ViewComponent {
  constructor(
    private pb: PocketbaseService,
    private activeRoute: ActivatedRoute
  ) {
    this.back_to_lobby$.pipe(untilDestroyed(this)).subscribe();
    this.next_screen$.pipe(untilDestroyed(this)).subscribe();
  }

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

  owner$ = this.game$.pipe(
    switchMap((game) => {
      if (!game) return of(null);
      return from(this.pb.UsersCollection().getOne(game.owner));
    }),
    shareReplay(1)
  );

  gameState$ = this.game$.pipe(map((g) => g?.state_json));

  user$ = this.pb.CurrentUser().pipe(untilDestroyed(this));

  backToLobby() {
    this.back_to_lobby_event$.next();
  }

  back_to_lobby_event$ = new Subject<void>();
  back_to_lobby$ = this.back_to_lobby_event$.pipe(
    withLatestFrom(this.game$),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    tap(([_, game]) => {
      if (!game) return;
      const s = game.state_json;
      s.view = 'prepare';
      this.pb.Collection('games').update(game.id, { state_json: s });
    })
  );

  next() {
    this.next_screen_event$.next();
  }

  next_screen_event$ = new Subject<void>();
  next_screen$ = this.next_screen_event$.pipe(
    withLatestFrom(this.game$, this.gameState$),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    switchMap(([_, game, state]) => {
      if (!game || !state) return of(game);

      switch (state.view) {
        case 'vote':
          // go to review
          state.view = 'review';
          break;

        case 'review':
          // go to next index vote
          // if at last, then scoreboard
          if (state.index == state.songs.length - 1) {
            state.view = 'scoreboard';
          } else {
            state.view = 'vote';
            state.index += 1;
          }
          break;

        default:
          break;
      }
      return from(
        this.pb.Collection('games').update<Game>(game.id, { state_json: state })
      );
    })
  );
}

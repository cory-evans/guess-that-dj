import { Component, Input } from '@angular/core';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  BehaviorSubject,
  Subject,
  combineLatest,
  distinctUntilKeyChanged,
  filter,
  from,
  map,
  shareReplay,
  switchMap,
  tap,
  withLatestFrom,
} from 'rxjs';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import {
  GameTrack,
  GameTrackVote,
  UserSimple,
} from '../../../shared/models/games.models';
import { MatSelectionListChange } from '@angular/material/list';

@UntilDestroy()
@Component({
  selector: 'app-game-round-vote',
  templateUrl: './round-vote.component.html',
})
export class RoundVoteComponent {
  @Input() set gameTrackId(value: string) {
    this._gameTrackId$.next(value);
  }
  @Input() members?: UserSimple[];

  my_vote?: GameTrackVote;

  constructor(private pb: PocketbaseService) {
    this.update_vote$.pipe(untilDestroyed(this)).subscribe();
    combineLatest([this._gameTrackId$, this.me$])
      .pipe(
        map(([id, me]) => ({ id, me })),
        distinctUntilKeyChanged('id'),
        switchMap((x) => {
          return from(
            this.pb
              .Collection('game_track_vote')
              .getFirstListItem<GameTrackVote>(
                `game_track = "${x.id}" && user = "${x.me?.id}"`
              )
              .catch(() => null)
          );
        }),
        tap((r) => {
          if (r) {
            this.my_vote = r;
          }
        }),
        untilDestroyed(this)
      )
      .subscribe();
  }

  me$ = this.pb.CurrentUser().pipe(untilDestroyed(this));

  private _gameTrackId$ = new BehaviorSubject<string>('');
  gameTrack$ = this._gameTrackId$.pipe(
    filter((id) => !!id),
    switchMap((id) => {
      return from(this.pb.Collection('game_tracks').getOne<GameTrack>(id));
    }),
    shareReplay(1)
  );

  voteChange(event: MatSelectionListChange) {
    const selected = event.options
      .filter((o) => o.selected)
      .map((o) => o.value);
    if (selected.length == 0) {
      return;
    }

    this.update_vote_event$.next(selected[0]);
  }

  update_vote_event$ = new Subject<string>();
  update_vote$ = this.update_vote_event$.pipe(
    withLatestFrom(this.me$, this._gameTrackId$),
    switchMap(([vote_for, me, gameTrackId]) => {
      const v: Partial<GameTrackVote> = {
        user: me?.id,
        game_track: gameTrackId,
        vote: vote_for,
      };
      if (this.my_vote) {
        // update
        return from(
          this.pb
            .Collection('game_track_vote')
            .update<GameTrackVote>(this.my_vote.id, v)
        );
      } else {
        // create
        return from(
          this.pb.Collection('game_track_vote').create<GameTrackVote>(v)
        );
      }
    }),
    tap((vote) => {
      this.my_vote = vote;
    })
  );
}

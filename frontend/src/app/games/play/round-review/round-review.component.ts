import { Component, Input } from '@angular/core';
import {
  Game,
  GameTrack,
  GameTrackVote,
} from '../../../shared/models/games.models';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { AvatarService } from 'src/app/shared/services/avatar.service';
import {
  BehaviorSubject,
  filter,
  from,
  map,
  shareReplay,
  switchMap,
  withLatestFrom,
} from 'rxjs';
import { UntilDestroy } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-game-round-review',
  templateUrl: './round-review.component.html',
})
export class RoundReviewComponent {
  @Input() game?: Game;
  @Input() set gameTrackId(value: string) {
    this._gameTrackId$.next(value);
  }

  constructor(
    private pb: PocketbaseService,
    public avatarService: AvatarService
  ) {}

  private _gameTrackId$ = new BehaviorSubject<string>('');
  gameTrack$ = this._gameTrackId$.pipe(
    filter((id) => !!id),
    switchMap((id) => {
      return from(this.pb.Collection('game_tracks').getOne<GameTrack>(id));
    }),
    shareReplay(1)
  );

  votes$ = this._gameTrackId$.pipe(
    switchMap((id) => {
      if (!id) return [];

      return from(
        this.pb.Collection('game_track_vote').getFullList<GameTrackVote>({
          filter: `game_track = "${id}"`,
        })
      );
    }),
    shareReplay(1)
  );

  idWhoAddedThisTrack$ = this.gameTrack$.pipe(
    map((gt) => gt.added_by_user),
    shareReplay(1)
  );

  getResultFor(memberId: string) {
    return this.idWhoAddedThisTrack$.pipe(
      withLatestFrom(this.votes$),
      map(([correctUserId, all_votes]) => {
        const my_vote = all_votes.find((v) => v.user === memberId);

        if (!my_vote || my_vote.vote !== correctUserId) return 'bg-red-400';

        return 'bg-green-400';
      })
    );
  }
}

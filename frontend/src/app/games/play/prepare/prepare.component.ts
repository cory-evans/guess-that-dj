import { Component, Input, OnInit } from '@angular/core';
import { Game, GameTrack } from '../../games.models';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { ActivatedRoute } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import {
  combineLatest,
  take,
  map,
  filter,
  switchMap,
  Subject,
  debounceTime,
  of,
  from,
  withLatestFrom,
  tap,
} from 'rxjs';
import { SpotifyService } from 'src/app/shared/services/spotify.service';

@UntilDestroy()
@Component({
  selector: 'app-game-prepare',
  templateUrl: './prepare.component.html',
})
export class PrepareComponent implements OnInit {
  my_tracks: GameTrack[] = [];

  @Input() game: Game | null = null;

  constructor(
    private pb: PocketbaseService,
    private spotifyService: SpotifyService,
    private activeRoute: ActivatedRoute
  ) {
    this.add_track$.pipe(untilDestroyed(this)).subscribe();
  }

  ngOnInit(): void {
    combineLatest([this.user$])
      .pipe(take(1), untilDestroyed(this))
      .subscribe((x) => {
        if (this.game && x[0]) this.update_my_tracks(this.game.id, x[0].id);
      });
  }

  user$ = this.pb.CurrentUser().pipe(untilDestroyed(this));

  value?: string;
  onInput = new Subject<Event>();
  searchResults$ = this.onInput.pipe(
    map((e) => {
      const t = e.target as { value: string } | null;
      return t?.value;
    }),
    debounceTime(250),
    switchMap((term) => {
      if (!term) {
        return of([]);
      }

      return from(this.spotifyService.client.searchTracks(term)).pipe(
        map((resp) => resp.tracks.items)
      );
    })
  );

  get_artists_text(artists: { name: string }[]) {
    return artists.map((a) => a.name).join(', ');
  }

  update_my_tracks(gameId: string, userId: string) {
    this.pb
      .Collection('game_tracks')
      .getFullList<GameTrack>({
        filter: `added_by_user = "${userId}" && game = "${gameId}"`,
      })
      .then((items) => {
        this.my_tracks = items;
      });
  }

  add_track(track: SpotifyApi.TrackObjectFull) {
    this.add_track_event.next(track);
  }

  add_track_event = new Subject<SpotifyApi.TrackObjectFull>();
  add_track$ = this.add_track_event.pipe(
    withLatestFrom(this.user$),
    switchMap(([track, user]) => {
      const record: Partial<GameTrack> = {
        game: this.game?.id,
        added_by_user: user?.id,
        track_id: track.id,
        track_name: track.name,
        track_album_image_url: track.album.images[0].url,
        track_artists_csv: this.get_artists_text(track.artists),
      };

      const p = this.pb
        .Collection('game_tracks')
        .getFirstListItem(
          `added_by_user = "${user?.id}" && track_id = "${track.id}" && game = "${this.game?.id}"`
        )
        .catch(() => undefined);
      return from(p).pipe(
        filter((x) => !x),
        switchMap(() => {
          return from(
            this.pb.Collection('game_tracks').create<GameTrack>(record)
          );
        }),
        tap(() => {
          this.update_my_tracks(this.game?.id || '', user?.id || '');
        })
      );
    })
  );
}

import { Component, OnDestroy, OnInit } from '@angular/core';
import { ClientResponseError, UnsubscribeFunc } from 'pocketbase';
import { BehaviorSubject, Subject, tap, withLatestFrom } from 'rxjs';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { Game } from '../../shared/models/games.models';
import { Router } from '@angular/router';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnDestroy, OnInit {
  constructor(private pb: PocketbaseService, private router: Router) {}

  games = new BehaviorSubject<Game[]>([]);

  unsubGames?: UnsubscribeFunc;

  ngOnInit(): void {
    this.join_game$.pipe(untilDestroyed(this)).subscribe();
    this.pb
      .Collection('games')
      .getFullList<Game>()
      .then((games) => this.games.next(games));

    this.pb
      .Collection('games')
      .subscribe<Game>('*', (sub) => {
        console.log(sub);
        const current = this.games.value;
        const found = current.find((i) => i.id == sub.record.id);
        switch (sub.action) {
          case 'update':
          case 'create':
            // find in list
            if (found) {
              found.entries_per_player = sub.record.entries_per_player;
              found.owner = sub.record.owner;
            } else {
              current.push(sub.record);
            }

            this.games.next(current);
            break;
          case 'delete':
            if (found) {
              this.games.next(current.filter((g) => g.id !== found.id));
            }
            break;
        }
      })
      .then((unsubFunc) => (this.unsubGames = unsubFunc));
  }

  ngOnDestroy(): void {
    if (this.unsubGames) this.unsubGames();
  }

  user$ = this.pb.CurrentUser();

  async joinGame(id: string) {
    this.join_game_event$.next(id);
  }

  join_game_event$ = new Subject<string>();
  join_game$ = this.join_game_event$.pipe(
    withLatestFrom(this.user$),
    tap(([id, user]) => {
      if (!user) return;

      this.pb
        .Collection('game_member')
        .getFirstListItem(`user = "${user.id}" && game = "${id}"`)
        .catch(async (err: ClientResponseError) => {
          if (err.status == 404) {
            // create new record
            return await this.pb.Collection('game_member').create({
              user: user.id,
              game: id,
              ready: false,
            });
          }
          return undefined;
        })
        .then((record) => {
          if (record) this.router.navigate(['games', id]);
        });
    })
  );
}

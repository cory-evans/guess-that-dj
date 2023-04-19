import { Component, OnDestroy, OnInit } from '@angular/core';
import { UnsubscribeFunc } from 'pocketbase';
import { BehaviorSubject } from 'rxjs';
import { PocketbaseService } from 'src/app/shared/services/pocketbase.service';
import { Game } from '../games.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
})
export class ListComponent implements OnDestroy, OnInit {
  constructor(private pb: PocketbaseService, private router: Router) {}

  games = new BehaviorSubject<Game[]>([]);

  unsubGames?: UnsubscribeFunc;

  ngOnInit(): void {
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

  async joinGame(id: string) {
    this.router.navigate(['games', id]);
    // const myId = this.pb.authStore().model?.id;
    // if (!myId) return;

    // const membership = await this.pb
    //   .Collection('game_member')
    //   .getFirstListItem(`user = "${myId}" && game = "${id}"`)
    //   .catch(() => undefined);

    // if (!membership) {
    //   await this.pb.Collection('game_member').create({
    //     user: myId,
    //     game: id,
    //   });
    // }
  }
}

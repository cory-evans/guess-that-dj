import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { AvailableGame } from '../models/games.models';

@Injectable({
  providedIn: 'root',
})
export class GameService {
  constructor(private pb: PocketbaseService) {}

  advertise_game(game_id: string, title: string) {
    const x: Partial<AvailableGame> = {
      game: game_id,
      title,
    };
    return this.pb.Collection('available_games').create<AvailableGame>(x);
  }

  remove_advertise_game(game_id: string) {
    this.pb
      .Collection('available_games')
      .getFirstListItem(`game = "${game_id}"`)
      .then((r) => {
        return this.pb.Collection('available_games').delete(r.id);
      })
      .catch();
  }
}

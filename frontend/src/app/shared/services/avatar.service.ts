import { Injectable } from '@angular/core';
import { PocketbaseService } from './pocketbase.service';
import { Observable, catchError, from, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AvatarService {
  constructor(private pb: PocketbaseService) {}

  private collection_name = 'external_avatars';
  private cache: { [k: string]: string | undefined } = {};

  getAvatarForUser(id?: string): Observable<string> {
    if (!id) {
      return this.getRandomAvatar();
    }

    const cached = this.cache[id];
    if (cached !== undefined) {
      return of(cached);
    }
    const p = this.pb
      .Collection(this.collection_name)
      .getFirstListItem(`user = "${id}"`);

    return from(p).pipe(
      map((record) => {
        this.cache[id] = record['avatar_url'];
        return record['avatar_url'];
      }),
      catchError(() => this.getRandomAvatar())
    );
  }

  getRandomAvatar() {
    const n = Math.floor(Math.random() * 9);
    return of(`http://localhost:8090/_/images/avatars/avatar${n}.svg`);
  }
}

import { Injectable } from '@angular/core';
import PocketBase, { Admin, Record, RecordSubscription } from 'pocketbase';
import {
  BehaviorSubject,
  Observable,
  Unsubscribable,
  from,
  map,
  switchMap,
} from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PocketbaseService {
  private pb = new PocketBase('http://localhost:8090');

  constructor() {
    this.currentUser$.next(this.pb.authStore.model);
  }

  private currentUser$ = new BehaviorSubject<Record | Admin | null>(null);
  CurrentUser() {
    return this.currentUser$.asObservable();
  }

  Collection(name: string) {
    return this.pb.collection(name);
  }

  UsersCollection() {
    return this.Collection('users');
  }

  isAuthenticated() {
    return this.currentUser$.pipe(map((cu) => cu !== null));
  }

  signIn(code: string, code_verifier: string) {
    return this.UsersCollection()
      .authWithOAuth2Code(
        'spotify',
        code,
        code_verifier,
        window.location.origin + '/auth/callback'
      )
      .then((resp) => {
        this.currentUser$.next(resp.record);
        if (resp.meta) {
          // update user
          const name = resp.meta['name'] as string;
          const avatar_url = resp.meta['avatarUrl'] as string;
          this.UsersCollection().update(resp.record.id, {
            username: name,
          });
          const avatar_col = this.Collection('external_avatars');
          avatar_col
            .getList(1, 1, {
              filter: `user = "${resp.record.id}"`,
            })
            .then((myAvatar) => {
              if (myAvatar.items.length > 0) {
                avatar_col.update(myAvatar.items[0].id, { avatar_url });
              } else {
                avatar_col.create({ user: resp.record.id, avatar_url });
              }
            });
          // set refresh and access tokens
          localStorage.setItem('access_token', resp.meta['accessToken']);
          localStorage.setItem('refresh_token', resp.meta['refreshToken']);
        }
      });
  }

  signOut() {
    this.pb.authStore.clear();
    this.currentUser$.next(null);
  }

  trackObject<T>(collection_name: string, id: string) {
    const u: Unsubscribable = {
      unsubscribe: () => {
        console.error('default unsub func');
      },
    };
    return new Observable<T | null>((subscriber) => {
      this.pb
        .collection(collection_name)
        .getOne<T>(id)
        .then((record) => {
          subscriber.next(record);
        })
        .catch(() => {
          subscriber.next(null);
        });
      this.pb
        .collection(collection_name)
        .subscribe<T>(id, (record) => {
          switch (record.action) {
            case 'create':
            case 'update':
              subscriber.next(record.record);
              break;
            case 'delete':
              subscriber.next(null);
          }
        })
        .then((unsub) => (u.unsubscribe = unsub));

      return u;
    });
  }
}

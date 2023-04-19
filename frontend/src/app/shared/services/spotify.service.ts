import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import SpotifyWebApi from 'spotify-web-api-js';

@Injectable({
  providedIn: 'root',
})
export class SpotifyService {
  private spotify = new SpotifyWebApi();

  constructor(private http: HttpClient) {}

  get client() {
    // get access_token
    const token = localStorage.getItem('access_token');
    this.spotify.setAccessToken(token);
    return this.spotify;
  }
}

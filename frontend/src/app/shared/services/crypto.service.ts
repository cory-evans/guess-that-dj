import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CryptoService {
  private _alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  RandomString(length: number) {
    let text = '';
    for (let i = 0; i < length; i++) {
      text += this._alphabet.charAt(
        Math.floor(Math.random() * this._alphabet.length)
      );
    }

    return text;
  }

  private async _digest(data: BufferSource) {
    return await window.crypto.subtle.digest('SHA-256', data);
  }

  private base64encode(data: ArrayBuffer) {
    const arr = new Uint8Array(data);
    return btoa(String.fromCharCode.apply(null, Array.from(arr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }

  async GenerateCodeChallenge(codeVerifier?: string) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const digest = await this._digest(data);

    return this.base64encode(digest);
  }
}

interface _base_model {
  id: string;
  created: string;
  updated: string;
}

export interface Game extends _base_model {
  owner: string;
  entries_per_player: number;

  state: string;
}

export interface GameTrack extends _base_model {
  game: string;
  added_by_user: string;

  track_id: string;
  track_name: string;
  track_album_image_url: string;
  track_artists_csv: string;
}

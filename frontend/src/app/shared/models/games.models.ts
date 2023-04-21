interface _base_model {
  id: string;
  created: string;
  updated: string;
}

export interface UserSimple extends _base_model {
  username: string;
}

export interface GameMember extends _base_model {
  user: string;
  game: string;
  ready: boolean;
}

export interface GameState {
  view: 'prepare' | 'vote' | 'review' | 'scoreboard';
  songs: string[];
  index: number;
}

export interface Game extends _base_model {
  owner: string;
  entries_per_player: number;

  state_json: GameState;
  members_json: UserSimple[];
}

export interface GameTrack extends _base_model {
  game: string;
  added_by_user: string;

  track_id: string;
  track_name: string;
  track_album_image_url: string;
  track_artists_csv: string;
}

export interface GameTrackVote extends _base_model {
  game_track: string;
  user: string;
  vote: string;
}

export interface AvailableGame extends _base_model {
  game: string;
  title: string;
}

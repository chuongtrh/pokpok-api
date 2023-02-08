export interface Player {
  id: string;
  name: string;
  profit: number;
  total_buyin: number;
  total_cashout: number;
}

export interface AddPlayer {
  id: string;
  name: string;
}

export interface AddPlayerDTO {
  players: [AddPlayer];
}

export interface CreateGameDTO {
  stack: number;
  rate: number;
  type: string;
  name: string;
  players: [AddPlayer];
}

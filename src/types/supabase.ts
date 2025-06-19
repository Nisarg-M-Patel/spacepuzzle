
export interface GameRoom {
  id: string;
  room_code: string;
  created_at: string;
  image_url: string;
  image_title: string | null;
  image_explanation: string | null;
  status: 'waiting' | 'playing' | 'completed';
  winner_id: string | null;
}

export interface GamePlayer {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string;
  is_host: boolean;
  joined_at: string;
  puzzle_state: any | null;
  moves_count: number;
  completed_at: string | null;
}
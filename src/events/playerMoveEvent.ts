import { Subjects } from './subjects';

export interface PlayerMoveEvent {
  subject: Subjects.PlayerMove
  data: {
    id: number;
    gameId: number;
    player: number;
    moveCell: number;
    isOpponentStart: boolean;
  };
}



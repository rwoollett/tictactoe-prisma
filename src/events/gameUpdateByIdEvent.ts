import { Subjects } from './subjects';

export interface GameUpdateByIdEvent {
  subject: Subjects.GameUpdateById
  data: {
    gameId: number;
    board: string;
    result: string;
  };
}



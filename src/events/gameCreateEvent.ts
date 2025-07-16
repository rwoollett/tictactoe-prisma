import { Subjects } from './subjects';

export interface GameCreateEvent {
  subject: Subjects.GameCreate
  data: {
    gameId: number;
    board: string;
    createdAt: string;
  };
}



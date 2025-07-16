import { FieldResolver } from "nexus";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { Subjects, GameCreateEvent, GameUpdateByIdEvent, PlayerMoveEvent } from "../../events";

/**
 * Create New Game 
 * 
 * The user post a mutation of createGame
 * The id create in game table is used to identify the game to the back end node cstoken workers.
 * The cstoken workers publish the game update to the game id.
 * The return Game data has the id which is needed to subscribe to with board updates.
 * 
 * @returns Game 
 */

export const createGameResolver: FieldResolver<
  "Mutation", "createGame"
> = async (_, { userId }, { prisma, pubsub }) => {

  const newGame = await prisma.game.create({ data: { userId } });

  // publish a createGame event
  pubsub && pubsub.publish(Subjects.GameCreate,
    {
      subject: Subjects.GameCreate,
      data: {
        gameId: newGame.id,
        board: newGame.board,
        createdAt: newGame.createdAt ? newGame.createdAt.toISOString() : ""
      }
    } as GameCreateEvent);

  return {
    id: newGame.id,
    userId,
    board: newGame.board,
    createdAt: newGame.createdAt ? newGame.createdAt.toISOString() : "",
  }
};


/**
 * Create/Update Board for Game by GameId 
 * 
 * The server post a mutation of updateBoardGame
 * The id create in game table is used to identify the game to the back end node cstoken workers.
 * This publishes the game update as a subscription to end user - who has the game id.
 * 
 * @returns Game 
 */

export const serverUpdateBoardResolver: FieldResolver<
  "Mutation", "serverUpdateBoard"
> = async (_, { gameId, board, result }, { prisma, pubsub }) => {

  try {
    const game = await prisma.game.findFirst({ where: { id: gameId } });
    if (game) {
      const updateGame = await prisma.game.update({
        select: {
          id: true,
          userId: true,
          createdAt: true,
          board: true,
          playerMoves: {
            select: {
              id: true,
              allocated: true,
              gameId: true,
              player: true,
              moveCell: true,
            }
          }
        },
        data: {
          board: board
        },
        where: {
          id: game.id
        }
      });

      pubsub && pubsub.publish(Subjects.GameUpdateById,
        {
          subject: Subjects.GameUpdateById,
          data: { gameId, board, result }
        } as GameUpdateByIdEvent);

      return {
        ...updateGame,
        createdAt: updateGame.createdAt ? updateGame.createdAt.toISOString() : "",
      };
    } else {
      throw new Error(`Game Id not found: ${gameId}. Could not publish a new board.`);
    }

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    throw new Error(`Game Id not found: ${gameId}. Could not publish a new board.`);
  };
};

/**
 * Start Game with game id
 * 
 * return game with empty board of played moves.
 * This update to board could need changing to be updated by server netp processes.
 *   - using a record with field allocate, and server netp reading and then processing the clearing of board, then
 *     publishing the clear with client web app subcribe to UpdateBoard by gameId.
 */
export const startGameResolver: FieldResolver<
  "Mutation", "startGame"
> = async (_, { gameId }, { prisma, pubsub }) => {
  try {
    await prisma.game.findFirstOrThrow({ where: { id: gameId } });

    const board = Array(9).fill(0).join(","); // This could need changing to be updated by server netp processes rather than a client change to board
    const updateGame = await prisma.game.update({
      select: {
        id: true,
        userId: true,
        board: true,
        createdAt: true
      },
      where: { id: gameId },
      data: { board }
    });

    pubsub && pubsub.publish(Subjects.GameCreate,
      {
        subject: Subjects.GameCreate,
        data: {
          gameId: updateGame.id,
          board: updateGame.board,
          createdAt: updateGame.createdAt ? updateGame.createdAt.toISOString() : ""
        }
      } as GameCreateEvent);


    return {
      ...updateGame, board,
      createdAt: updateGame.createdAt ? updateGame.createdAt.toISOString() : ""
    }

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    throw new Error("Mutation startGame: " + (error as Error).message);
  };
}

/**
 * Subscribe to board created
 * 
 * @returns BoardCreated 
 */
export const subcribeBoardCreateResolver = (payload: GameCreateEvent) => {
  if (!payload) {
    return { gameId: -1, board: "", createdAt: "" };
  } else {
    const { data: { gameId, board, createdAt } } = payload;
    return { gameId, board, createdAt };
  }
};

/**
 * Subscribe to board updates by game id
 * 
 * @returns BoardOutput 
 */
export const subcribeBoardByGameIdResolver = (payload: GameUpdateByIdEvent) => {
  const { data: { gameId, board, result } } = payload;
  return { gameId, board, result };
};

/**
 * Make Player Move 
 * 
 * The user post a mutation of boardMove
 * The id create in game table is used to identify the game to the back end node cstoken workers.
 * The server netp client publish the game update to the game id.
 * The return Game data has the id which is needed to subscribe to with board updates.
 * 
 * @returns Game 
 */

export const boardMoveResolver: FieldResolver<
  "Mutation", "boardMove"
> = async (_, { gameId, player, moveCell, isOpponentStart }, { prisma, pubsub }) => {

  try {
    const newMove = await prisma.playerMove.create({
      data: {
        gameId,
        player,
        moveCell,
        isOpponentStart
      },
      select: {
        id: true,
        allocated: true,
        game: true
      }
    });

    // publish a createGame event
    pubsub && pubsub.publish(Subjects.PlayerMove,
      {
        subject: Subjects.PlayerMove,
        data: {
          id: newMove.id,
          gameId,
          player,
          moveCell,
          isOpponentStart
        }
      } as PlayerMoveEvent);

    return {
      id: newMove.id,
      allocated: newMove.allocated,
      gameId, player, moveCell, isOpponentStart,
      game: {
        id: newMove.game.id,
        board: newMove.game.board,
        userId: newMove.game.userId,
        createdAt: newMove.game.createdAt ? newMove.game.createdAt.toISOString() : ""
      }
    }

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    throw new Error("Mutation boardMove: " + (error as Error).message);
  };

};

/**
 * Subscribe to board moves 
 *  
 * @returns BoardMove 
 */
export const subcribeBoardMoveResolver = (payload: PlayerMoveEvent) => {
  const { data: { id: moveId, gameId, player, moveCell, isOpponentStart } } = payload;
  return { moveId, gameId, player, moveCell, isOpponentStart };
};

/**
 * Get Players Board Move 
 * 
 * Find the board moves posted by a user.
 * When retrieved the allocated field is updated to true. 
 * It will be processed by the back end nodeId, and then posted back with ServerUpdateBoard
 * to enable the publish of this game id to the end user.
 *  
 * @returns PlayerMove 
 */
export const getPlayerMoveResolver: FieldResolver<
  "Query",
  "getPlayerMove"
> = async (_, { nodeId }, { prisma }) => {

  try {
    const move = await prisma.playerMove.findFirst({
      select: {
        id: true,
        allocated: true
      },
      where:
      {
        allocated: false
      },
    });

    if (move) {
      const updateMove = await prisma.playerMove.update({
        select: {
          id: true,
          allocated: true,
          gameId: true,
          player: true,
          moveCell: true,
          isOpponentStart: true,
          game: {
            select: {
              board: true,
              userId: true,
              id: true,
              createdAt: true
            }
          }
        },
        data: {
          allocated: true
        },
        where: {
          id: move.id
        }
      });
      return [{
        ...updateMove,
        game: {
          ...updateMove.game,
          createdAt: updateMove.game.createdAt ? updateMove.game.createdAt.toISOString() : ""
        }
      }];
    } else {
      return [];
    }

  } catch (error) {
    if (
      error instanceof PrismaClientKnownRequestError &&
      error.code == 'P2025'
    ) {
      console.log(
        '\u001b[1;31m' +
        'PrismaClientKnownRequestError is catched' +
        '(Error name: ' +
        error.name +
        ')' +
        '\u001b[0m'
      );
    }
    return [];
  };
};

export const removeGameCompleteResolver: FieldResolver<
  "Mutation", "removeGameComplete"
> = async (_, { gameId }, { prisma }) => {
  const removeMany = await prisma.game.deleteMany({ where: { id: gameId } });
  const removeManyResult = await prisma.playerMove.deleteMany({ where: { gameId: gameId } });
  return { message: `Removed ${removeMany.count + removeManyResult.count} records successfully` };
};

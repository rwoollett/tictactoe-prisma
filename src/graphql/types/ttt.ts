import {
  booleanArg,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from 'nexus';
import { extendType } from 'nexus'
import { GameUpdateByIdEvent, Subjects } from '../../events';
import {
  boardMoveResolver,
  createGameResolver,
  getPlayerMoveResolver,
  removeGameCompleteResolver,
  serverUpdateBoardResolver,
  startGameResolver,
  subcribeBoardByGameIdResolver,
  subcribeBoardCreateResolver,
  subcribeBoardMoveResolver
} from '../resolvers/ttt';
import { withFilter } from 'graphql-subscriptions';

/**
 * Game
 */
export const Game = objectType({
  name: 'Game',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('userId')
    t.nonNull.string('board')
    t.nonNull.string('createdAt')
  },
  description: "Tic Tac Toes game board. The player can play as Nought(1) or Cross(2). O is empty cell."
});

/**
 * Player Move
 */
export const PlayerMove = objectType({
  name: 'PlayerMove',
  definition(t) {
    t.nonNull.int('id')
    t.nonNull.int('gameId')
    t.nonNull.int('player')
    t.nonNull.int('moveCell')
    t.nonNull.boolean('isOpponentStart')
    t.nonNull.boolean('allocated', {
      description: "When found with query getPlayerMove as findFirst this is marked true."
    })
    t.nonNull.field('game', { type: 'Game' })
  },
  description: "The players moves in the Tic Tac Toe board against oppenent."
})

export const TTTQuery = extendType({
  type: 'Query',
  definition(t) {
    t.field('getPlayerMove', {
      type: list('PlayerMove'),
      args: {
        nodeId: nonNull(stringArg())
      },
      resolve: getPlayerMoveResolver
    });
  },
});

export const RemovalResult = objectType({
  name: 'RemovalResult',
  definition(t) {
    t.nonNull.string('message')
  },
  description: "Removal result."
})

export const TTTMutations = extendType({
  type: 'Mutation',
  definition(t) {
    t.nonNull.field('createGame', {
      type: 'Game',
      args: {
        userId: nonNull(intArg()),
      },
      resolve: createGameResolver
    });
    t.nonNull.field('startGame', {
      type: 'Game',
      args: {
        gameId: nonNull(intArg()),
      },
      resolve: startGameResolver
    });
    t.nonNull.field('serverUpdateBoard', {
      type: 'Game',
      args: {
        gameId: nonNull(intArg()),
        board: nonNull(stringArg()),
        result: nonNull(stringArg())
      },
      resolve: serverUpdateBoardResolver
    });
    t.nonNull.field('boardMove', {
      type: 'PlayerMove',
      args: {
        gameId: nonNull(intArg()),
        player: nonNull(intArg()),
        moveCell: nonNull(intArg()),
        isOpponentStart: nonNull(booleanArg())
      },
      resolve: boardMoveResolver
    });
    t.nonNull.field('removeGameComplete', {
      type: 'RemovalResult',
      args: {
        gameId: nonNull(intArg())
      },
      resolve: removeGameCompleteResolver
    });

  },
})

export const BoardCreated = objectType({
  name: 'BoardCreated',
  definition(t) {
    t.nonNull.int('gameId')
    t.nonNull.string('board')
    t.nonNull.string('createdAt')
  },
  description: "A board is created of tictactoe"
});

export const BoardOutput = objectType({
  name: 'BoardOutput',
  definition(t) {
    t.nonNull.int('gameId')
    t.nonNull.string('board')
    t.nonNull.string('result')
  },
  description: "A board update of tictactoe"
});

export const BoardMove = objectType({
  name: 'BoardMove',
  definition(t) {
    t.nonNull.int('moveId')
    t.nonNull.int('gameId')
    t.nonNull.int('player')
    t.nonNull.int('moveCell')
    t.nonNull.boolean('isOpponentStart')
  },
  description: "A player makes a board move event"
});

export const Subscription = extendType({
  type: "Subscription",
  definition(t) {
    t.field(Subjects.GameUpdateById, {
      type: 'BoardOutput',
      args: {
        gameId: nonNull(intArg())
      },
      subscribe: withFilter(
        (_root, _args, ctx) => ctx?.pubsub?.asyncIterableIterator(Subjects.GameUpdateById) ?? [],
        (msg: object | undefined, variables) => {
          const event = msg as GameUpdateByIdEvent | undefined;
          return event?.data?.gameId === variables?.gameId;
        }),
      resolve: subcribeBoardByGameIdResolver
    });
    t.field(Subjects.GameCreate, {
      type: 'BoardCreated',
      args: {
        isCreate: nonNull(booleanArg())
      },
      subscribe(_root, _args, ctx) {
        return ctx?.pubsub?.asyncIterableIterator(Subjects.GameCreate);
      },
      resolve: subcribeBoardCreateResolver
    });
    t.field(Subjects.PlayerMove, {
      type: 'BoardMove',
      args: {
        gameId: nonNull(intArg())
      },
      subscribe(_root, _args, ctx) {
        return ctx?.pubsub?.asyncIterableIterator(Subjects.PlayerMove);
      },
      resolve: subcribeBoardMoveResolver
    });

  },
});

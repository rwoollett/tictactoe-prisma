import { createTestContext } from './__helpers';

const ctx = createTestContext({ portRange: { from: 4000, to: 6000 } });

it('it create a new game of Tic Tac Toe', async () => {

  await ctx.prisma.game.create({
    data: {
      userId: 100
    }
  });

  const amount = await ctx.prisma.game.count();
  expect(amount).toMatchInlineSnapshot(`1`);


});

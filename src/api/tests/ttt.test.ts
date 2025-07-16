import { createTestContext } from './__helpers';

const ctx = createTestContext({ portRange: { from: 4000, to: 6000 } });

import { NexusGenFieldTypes } from '../../generated/nexus-typegen';

it('it create a new game of Tic Tac Toe', async () => {

  const requestSignIn: NexusGenFieldTypes["Mutation"] = await ctx.client.request(`
      mutation SigninTMRole($nodeId: String!, $nodeName: String!) {
      signinTMRole(nodeId: $nodeId, nodeName: $nodeName) {
        granted
        message
      }
    } `, {
    "nodeId": "5010",
    "nodeName": "Orange"
  });

  expect(requestSignIn.signinTMRole).toMatchInlineSnapshot(`
{
  "granted": true,
  "message": "Successfully granted to become task manager.",
}
`);


});

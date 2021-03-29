import { useAuth, useCeramic } from "../providers/ceramic";

import { useAsync, useAsyncFn } from "react-use";
import { sendProposal } from "../utils";
import { useMutation, useQuery } from "react-query";

export function useConvictionState() {
  const { idx } = useCeramic();
  return useQuery("convictionState", () =>
    idx.get(idx.config.definitions.convictionstate, idx.config.did)
  );
}

export function useDocument(id) {
  const { ceramic } = useCeramic();
  return useQuery(["doc", id], () =>
    ceramic.loadDocument(id).then((doc) => doc?.content)
  );
}

export function useConvictions() {
  const { idx } = useCeramic();
  // const { did } = useAuth();
  return useQuery("convictions", async () => {
    // if (!did) {
    //   console.log("Not authenticated");
    //   return null;
    // }
    return getConvictions(idx);
  });
}

export function useCreateProposal() {
  const { ceramic, idx, signIn } = useCeramic();
  return useMutation((proposal) => {
    console.log("creating doc", proposal, "authed", idx.authenticated);

    // Create proposal document
    return ceramic
      .createDocument("tile", {
        content: proposal,
        metadata: {
          schema: idx.config.schemas.Proposal,
          controllers: [idx.id],
        },
      })
      .then(async (doc) => {
        console.log(doc);
        const proposalId = doc.id.toString();
        const convictions = await getConvictions(idx);

        convictions.proposals = convictions.proposals.concat(proposalId);
        console.log("convictions", convictions);
        await Promise.all([
          idx.set(idx.config.definitions.convictions, convictions),
          // Send proposalId to snapshot service to update convictionState
          sendProposal(proposalId),
        ]);

        return proposalId;
      });
  });
  return useAsyncFn(
    async (proposal) => {
      console.log("creating doc", proposal, "authed", idx.authenticated);
      if (!idx.authenticated) {
        console.log("Not authenticated");
        await signIn();
      }

      // Create proposal document
      return ceramic
        .createDocument("tile", {
          content: proposal,
          metadata: {
            schema: idx.config.schemas.Proposal,
            controllers: [idx.id],
          },
        })
        .then(async (doc) => {
          console.log(doc);
          const proposalId = doc.id.toString();
          const convictions = await getConvictions(idx);

          convictions.proposals = convictions.proposals.concat(proposalId);
          console.log("convictions", convictions);
          idx.set(idx.config.definitions.convictions, convictions);
          // Send proposalId to snapshot service to update convictionState
          sendProposal(proposalId);

          return proposalId;
        });
    },
    [ceramic, idx]
  );
}

export function useCreateVote() {
  const { ceramic, idx, signIn } = useCeramic();
  return useAsyncFn(
    async (vote) => {
      console.log("creating vote", vote);
      if (!idx.authenticated) {
        console.log("Not authenticated");
        await signIn();
      }

      const convictions = await getConvictions(idx);
      console.log("useCreateVote", convictions);
      convictions.convictions = convictions.convictions.reduce(
        (acc, vote) => ({ ...acc, [vote.proposal]: vote }),
        {}
      );
      convictions.convictions[vote.proposal] = vote;

      console.log("UPDATE STATES", convictions.convictions);
      idx.set(idx.config.definitions.convictions, Object.values(convictions));
    },
    [ceramic, idx]
  );
}

const getConvictions = async (idx) => {
  return (
    (await idx.get(idx.config.definitions.convictions)) || {
      context: idx.config.context,
      proposals: [],
      convictions: [],
    }
  );
};

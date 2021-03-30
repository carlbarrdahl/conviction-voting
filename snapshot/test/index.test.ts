require("dotenv").config()

import { updateSnapshot } from "../src/snapshot"

const address = process.env.ADDRESS

const proposalIds = ["proposal1-docId", "proposal2-docId"]
const convictionIds = ["conviction1-docId", "conviction2-docId"]
const proposals = {
  [proposalIds[0]]: {
    context: address,
    title: "Develop an off-chain conviction voting system",
    currency: "ETH",
    amount: 200,
    beneficiary: "0xabcdef",
    description:
      "Fund team X to implement off-chain conviction voting using Ceramic & IDX.",
    url: "https://ceramic.network",
  },
  [proposalIds[1]]: {
    context: address,
    title: "Learn about ethereum and smart contracts",
    currency: "ETH",
    amount: 100,
    beneficiary: "0xabcdeg",
    description:
      "Get a better understanding in how Ethereum, smart contracts, zkRollups and other technologies in the space work.",
    url: "https://ceramic.network",
  },
}
const convictions = {
  [convictionIds[0]]: {
    context: address,
    proposals: [proposalIds[0]],
    convictions: [
      {
        proposal: proposalIds[0],
        allocation: 0.2,
      },
      {
        proposal: proposalIds[1],
        allocation: 0.5,
      },
    ],
  },
  [convictionIds[1]]: {
    context: address,
    proposals: [proposalIds[1]],
    convictions: [
      {
        proposal: proposalIds[0],
        allocation: 0.4,
      },
      {
        proposal: proposalIds[1],
        allocation: 0.7,
      },
    ],
  },
}

const convictionState = {
  context: address,
  supply: 10000,
  participants: [
    {
      account: "0x12345...",
      balance: 1000,
      convictions: convictionIds[0],
    },
    {
      account: "0xabcde...",
      balance: 3000,
      convictions: convictionIds[1],
    },
    {
      account: "0xabcde...",
      balance: 1500,
      convictions: convictionIds[0],
    },
  ],
  proposals: [
    {
      proposal: proposalIds[0],
      totalConviction: 0,
      triggered: false,
    },
    {
      proposal: proposalIds[1],
      totalConviction: 0,
      triggered: false,
    },
  ],
}

const tokenHolders = {
  supply: 10000,
  holders: [
    { address: "0x6A4E948a81E20802C91bB48D825A741a6F1E9062", balance: 1000 },
    { address: "0x7eb9d67f9daea510399a1ee978b36e66626058d1", balance: 3000 },
    { address: "0x7eb9d67f9daea510399a1ee978b36e66626058e1", balance: 1500 },
  ],
}

describe("Snapshot service", () => {
  it("builds a ConvictionState", async () => {
    const state = await updateSnapshot(
      "eip155:1/erc20:0x56687cf29ac9751ce2a4e764680b6ad7e668942e"
    )
    console.log(JSON.stringify(state, null, 2))
  }, 30000)
  it("calculates threshold", async () => {
    // const state = await fetchConvictionState("docId")
    // const proposals = await fetchProposals(state.proposals)
    // const participants = await fetchParticipantsConvictions(state.participants)
    // const last = Array.from({ length: 14 })
    //   .fill(state)
    //   .reduce((p: any, n: any) => {
    //     return {
    //       ...p,
    //       proposals: proposals.map(proposal =>
    //         calculateConviction(proposal, participants, p)
    //       ),
    //     }
    //   }, state)
    // console.log("14 days later", last)
    // expect(last).toEqual({})
  })
})

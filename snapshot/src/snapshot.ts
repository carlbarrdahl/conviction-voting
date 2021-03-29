import { fetchTokenHolders } from "./thegraph"
import {
  fetchConvictionState,
  fetchConvictionDocID,
  fetchDocuments,
  setConvictionState,
} from "./ceramic"
import { Convictions, Participants } from "./types"

const NUM_UPDATES = 1
const ALPHA = Number(process.env.ALPHA || 2 ** (-1 / (7 * NUM_UPDATES))) // 7 day half-life

// Add a new proposal to the conviction state so we don't have to wait for a snapshot update
export async function addProposal(proposal: string) {
  console.log("Adding proposal to ConvictionState")
  const state = await fetchConvictionState()

  state.proposals.push({ proposal, totalConviction: 0, triggered: false })
  return setConvictionState(state)
}

export async function updateSnapshot(address: string) {
  console.log("Updating ConvictionState snapshot for:", address)

  // Fetch previous convictionState (or create a new one)
  const convictionState = await fetchConvictionState()
  console.log("Previous ConvictionState loaded:", convictionState)

  // Fetch token holders + supply from TheGraph
  console.log("Fetching token holders and supply")
  const { holders, supply } = await fetchTokenHolders(convictionState.context)
  console.log(`${holders.length} holders found with supply: ${supply}`)

  // Create participants state with ref to ceramic convictions docId
  const participants = (
    await Promise.all(
      holders.map(async ({ address, balance }) => {
        console.log(address, balance)
        const convictions = await fetchConvictionDocID(address)
        if (!convictions) return
        return {
          account: address,
          balance,
          convictions,
        }
      })
    )
  ).filter(Boolean) as any[] // Remove undefined
  console.log(participants)
  // Fetch proposal and conviction documents from Ceramic
  console.log(`Fetching ceramic documents for ${participants.length} holders`)
  const { convictionDocs, proposalDocs } = await fetchDocuments(participants)

  console.log(`Calculating next conviction state`, convictionDocs, proposalDocs)
  // Calculate next conviction for proposals
  // https://github.com/1Hive/conviction-voting-cadcad/blob/master/algorithm_overview.ipynb
  const proposals = Object.entries(proposalDocs).map(([id, proposal]: any) => {
    // Fetch previous conviction state for proposal
    const previous = convictionState.proposals.find(
      (p: any) => p.proposal === id
    )
    const conviction = previous ? previous.totalConviction : 0

    // Sum the total funds for each participants support for the proposal
    const funds = sumSupport(id, convictionDocs)

    // Calculate if proposal has reached enough conviction
    const threshold = triggerThreshold({
      requested: Number(proposal.amount),
      funds,
      supply: Number(convictionState.supply),
      alpha: ALPHA,
      params: {
        rho: 0.0025,
        beta: 0.2,
      },
    })

    const totalConviction = ALPHA * conviction + funds
    const triggered = totalConviction >= threshold
    return {
      proposal: id,
      totalConviction,
      triggered,
    }
  })

  return setConvictionState({
    context: convictionState.context,
    supply,
    proposals,
    participants,
  })
}

// Calculate total number of tokens for each participants allocation on proposal
export function sumSupport(
  proposalId: string,
  participants: (Participants & { data: Convictions })[]
) {
  // Loop through participants
  return participants.reduce<number>((sum, participant) => {
    // Get conviction for current proposal
    const conviction = (participant.data?.convictions || []).find(
      (c: any) => c.proposal === proposalId
    )
    if (!conviction) {
      return sum
    }
    return sum + conviction.allocation * participant.balance
  }, 0)
}

interface Threshold {
  requested: number
  funds: number
  supply: number
  alpha: number
  params: { rho: number; beta: number }
}

// Calculate conviction threshold value
// https://nbviewer.jupyter.org/github/BlockScience/Aragon_Conviction_Voting/blob/master/models/v3/Trigger_Function_Explanation.ipynb
export function triggerThreshold({
  requested,
  funds,
  supply,
  alpha,
  params,
}: Threshold) {
  const share = requested / funds
  console.log({ requested, funds, supply, alpha })
  if (share < params.beta) {
    return (
      (((params.rho * supply) / (params.beta - share) ** 2) * 1) / (1 - alpha)
    )
  } else {
    return Infinity
  }
}

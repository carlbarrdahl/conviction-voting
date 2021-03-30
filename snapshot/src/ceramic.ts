require("dotenv").config()
global["fetch"] = require("node-fetch")
import Ceramic from "@ceramicnetwork/http-client"
import { IDX } from "@ceramicstudio/idx"
import { Ed25519Provider } from "key-did-provider-ed25519"
import fromString from "uint8arrays/from-string"

import { Convictions, ConvictionState, Participants, Proposal } from "./types"

const CERAMIC_HOST = process.env.CERAMIC_HOST
const SEED = process.env.SEED || "<invalid_seed>"

let config: any = {}
try {
  config = require("./config.json")
} catch (error) {
  console.error("Run bootstrap to generate config.json")
}

const ceramic = new Ceramic(CERAMIC_HOST)
const idx = new IDX({ ceramic, aliases: config.definitions })

// Convert eth address to did
const toDID = async (address: string): Promise<string> => {
  const caip10Doc = await ceramic.createDocument("caip10-link", {
    metadata: {
      family: "caip10-link",
      controllers: [address.toLowerCase() + "@eip155:1"],
    },
  })

  return caip10Doc?.content
}

async function authCeramic() {
  if (ceramic.did?.id) return
  const provider = new Ed25519Provider(fromString(SEED, "base16"))
  await ceramic.setDIDProvider(provider)
  console.log("Ceramic identity initialized", ceramic?.did?.id)
}

export async function fetchConvictionDocID(address: string) {
  const did = await toDID(address)
  if (!did) return
  return idx.getRecordID(config.definitions.convictions, did)
}

export async function fetchOrCreateConvictionState() {
  await authCeramic()
  // Get or create state
  const state =
    (await idx.get("convictionstate")) ||
    (await setConvictionState({
      context: config.context,
      supply: 0,
      participants: [],
      proposals: [],
    }))

  return state as ConvictionState
}

export async function setConvictionState(next: ConvictionState) {
  console.log("Updating ConvictionState", next)
  await idx.set("convictionstate", next)
  console.log("ConvictionState updated")
  return idx.get("convictionstate")
}

export async function fetchDocuments(participants: Participants[]) {
  const proposalDocs: { [key: string]: Proposal } = {}
  const convictionDocs = await Promise.all(
    participants.map(async (participant: any) => {
      const data = await fetchDocument<Convictions>(participant.convictions)

      // Load proposal docs
      await Promise.all(
        data.proposals.map(async (id: string) => {
          proposalDocs[id] =
            proposalDocs[id] || (await fetchDocument<Proposal>(id))
        })
      )

      return { ...participant, data }
    })
  )

  return { convictionDocs, proposalDocs }
}

export async function fetchDocument<T>(id: string): Promise<T> {
  console.log("Fetching ceramic doc:", id)
  const doc = await ceramic.loadDocument(id)
  return doc?.content
}

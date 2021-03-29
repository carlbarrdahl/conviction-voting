import fastify from "fastify"
import { addProposal, updateSnapshot } from "./snapshot"

import config from "./config.json"

const server = fastify()
server.register(require("fastify-cors"), { origin: true })

server.get("/config", async (req, res) => config)

server.post<{ Body: { proposal: string } }>("/proposal", async (req, res) =>
  addProposal(req.body.proposal)
)

server.post("/snapshot", async (req, res) =>
  // TODO: verify auth token
  updateSnapshot(config.context)
)

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

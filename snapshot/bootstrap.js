require("dotenv").config()
const { writeFile } = require("fs").promises

const Ceramic = require("@ceramicnetwork/http-client").default
const { createDefinition, publishSchema } = require("@ceramicstudio/idx-tools")
const { Ed25519Provider } = require("key-did-provider-ed25519")

const fromString = require("uint8arrays/from-string")

const ConvictionStateSchema = require("./src/schemas/conviction-state.json")
const ConvictionsSchema = require("./src/schemas/convictions.json")
const ProposalSchema = require("./src/schemas/proposal.json")

const CERAMIC_HOST = "http://localhost:7007"
// process.env.NODE_ENV === "production"
//   ? "https://ceramic-clay.3boxlabs.com"
//   : "http://localhost:7007"

const ceramic = new Ceramic(CERAMIC_HOST)
const SEED = process.env.SEED
const CONTEXT =
  process.env.CONTEXT ||
  "eip155:1/erc20:0x56687cf29ac9751ce2a4e764680b6ad7e668942e"

const config = {
  did: null,
  context: CONTEXT,
  definitions: {},
  schemas: {},
}

async function run() {
  console.log("Bootstrapping schemas and definitions")

  const provider = new Ed25519Provider(fromString(SEED, "base16"))
  await ceramic.setDIDProvider(provider)

  console.log("Ceramic initialized", ceramic?.did?.id)

  config.did = ceramic?.did?.id

  await Promise.all(
    [ConvictionStateSchema, ConvictionsSchema, ProposalSchema].map(
      async content => {
        const schema = await publishSchema(ceramic, {
          content,
          name: content.title,
        })
        console.log("Schema published:", content.title, schema.commitId.toUrl())

        const def = await createDefinition(ceramic, {
          name: content.title.toLowerCase(),
          description: content.title,
          schema: schema.commitId.toUrl(),
        })

        console.log("Definition created:", content.title, def.id.toString())

        // Add to config
        config.schemas[content.title] = schema.commitId.toUrl()
        config.definitions[content.title.toLowerCase()] = def.id.toString()

        return {
          key: content.title,
          value: schema.commitId.toUrl(),
        }
      }
    )
  )

  console.log("Writing config.json", config)
  await writeFile("./src/config.json", JSON.stringify(config))

  console.log("Config written to src/config.json file:", config)
  process.exit(0)
}

run().catch(console.error)

# Decentralized Conviction Voting using Ceramic

Inspired by:
https://blog.ceramic.network/trust-minimized-off-chain-conviction-voting

### Snapshot service

Node.js app deployed to Vercel with Github Actions to trigger function with cron job every x hours.

- Fetch all token holders using TheGraph
- Convert each holder address to DID
- Get convictions for DID with IDX
- Get proposals from convictions
- Calculate total conviction per proposal
- Calculate required convition per proposal
- Update state doc

* `npm run bootstrap` generates schemas and definitions used
* `npm run schema:ts` converts json-schema to Typescript types
* Server route `GET /config` returns snapshot did, definitions and schemas
* Server route `POST /snapshot` triggers an update for the ConvictionState (triggered from Github Actions cron job)

### Voting app

React app UI to create, list and vote for proposals.

- Call snapshot service for config (service did, definitions and schemas)
- Get conviction state for did and list proposals
- Sign in with Ethereum wallet (account address is used to map token balances)
- Create proposal
- Vote for proposals by allocation a fraction of tokens

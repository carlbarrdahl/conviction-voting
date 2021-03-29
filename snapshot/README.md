# Decentralized Conviction Voting using Ceramic

- What alternative ways to fetch token holders?
- When a proposal is created, it doesn't show up until snapshot service has been triggered

### Snapshot service

Node.js app deployed to Vercel with Github Actions to trigger function with cron job every x hours.

- Fetch all token holders using TheGraph
- Convert each holder address to DID
- Get convictions for DID with IDX
- Get proposals from convictions
- Calculate total conviction per proposal
- Update state doc

* `npm run bootstrap` generates schemas and definitions used
* `npm run schema:ts` converts json-schema to Typescript types
* Server route `GET /config` returns snapshot did, definitions and schemas
* Server route `POST /snapshot` triggers an update for the ConvictionState (triggered from Github Actions cron job)

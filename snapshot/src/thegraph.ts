global["fetch"] = require("node-fetch")

interface Balance {
  user: string
  amount: string
}
interface QueryData {
  tokens: { totalSupply: string }[]
  balances: Balance[]
}
interface QueryResults {
  data: QueryData
  errors: { message: string }[]
}

interface TokenHolders {
  supply: number
  holders: { address: string; balance: number }[]
}

export async function fetchTokenHolders(
  address: string
): Promise<TokenHolders> {
  const results: QueryData[] = []

  async function fetchTokenData(size = 500, skip = 0): Promise<QueryData[]> {
    console.log("making request: size, skip", size, skip)
    const query = `{
      tokens(where: {id: "${address}"}) {
        id
        totalSupply
      }
      balances(first: ${size}, skip: ${skip}, where: {token: "${address}"}) {
        user
        amount
      }
    }`
    return fetch(
      "https://api.thegraph.com/subgraphs/name/ianlapham/tokenholders",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      }
    )
      .then(res => res.json())
      .then(({ data, errors }: QueryResults) => {
        if (errors) {
          throw errors
        }
        results.push(data)

        // More data to fetch
        if (data?.balances.length === size) {
          return fetchTokenData(size, size * results.length)
        }
        return results
      })
  }

  return fetchTokenData().then(res => {
    return {
      supply: +res[0].tokens[0].totalSupply,
      holders: res
        // flatten all holders into one array
        .reduce<Balance[]>((acc, x) => acc.concat(...x.balances), [])
        .map(({ amount, user }) => ({ address: user, balance: +amount }))
        .filter(({ balance }) => balance > 0),
    }
  })
}

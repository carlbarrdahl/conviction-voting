const snapshotUrl = process.env.REACT_APP_SNAPSHOT_URL;

export async function fetchConfig() {
  return fetch(snapshotUrl + "/config").then((res) => res.json());
}

export async function sendProposal(proposal) {
  return fetch(snapshotUrl + "/proposal", {
    method: "POST",
    body: JSON.stringify({ proposal }),
  }).then((res) => res.json());
}

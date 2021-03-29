import WalletConnectProvider from "@walletconnect/web3-provider";

import { ThreeIdConnect, EthereumAuthProvider } from "3id-connect";

import Autherem from "authereum";

import Web3Modal from "web3modal";

export const threeID = new ThreeIdConnect();

export const web3Modal = new Web3Modal({
  network: "mainnet",
  cacheProvider: true,
  providerOptions: {
    walletconnect: {
      package: WalletConnectProvider,

      options: {
        infuraId: "f7a626beea774548afedbd7a53474c1e",
      },
    },
  },
  autherem: {
    package: Autherem,
    options: {},
  },
});

export default async function getProvider() {
  const ethProvider = await web3Modal.connect();
  const adresses = await ethProvider.enable();
  await threeID.connect(new EthereumAuthProvider(ethProvider, adresses[0]));
  return threeID.getDidProvider();
}

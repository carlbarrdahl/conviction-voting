import Ceramic from "@ceramicnetwork/http-client";
import { IDX } from "@ceramicstudio/idx";
import { createContext, useContext, useEffect, useState } from "react";
import { useMutation } from "react-query";
import getAuthProvider from "../lib/wallet";
import { fetchConfig } from "../utils";
import { Ed25519Provider } from "key-did-provider-ed25519";
import fromString from "uint8arrays/from-string";

const CeramicContext = createContext({});

export const useCeramic = () => useContext(CeramicContext);

export function useAuth() {
  const { ceramic, idx } = useCeramic();

  const { mutateAsync: signIn, isLoading } = useMutation(async () => {
    try {
      console.log("Signin in");
      const provider = await getAuthProvider();
      // const provider = new Ed25519Provider(
      //   fromString(
      //     "1e9e55128a8fc90e0fff74672127ad1060050ef6122ffebced982b2cf9463a22",
      //     "base16"
      //   )
      // );
      console.log(provider);
      await ceramic.setDIDProvider(provider);
      console.log("provider set", provider);
      const did = idx.authenticated ? idx.id : null;
    } catch (err) {
      console.error(err);
    }
  });

  return { signIn, isLoading, did: idx.authenticated ? idx.id : null };
}
export default function CeramicProvider({
  apiHost = /* "https://ceramic-clay.3boxlabs.com" ||  */ "http://localhost:7007",
  children,
}) {
  // Initialize Ceramic and IDX
  const [state, setCeramic] = useState({ ceramic: null, idx: null });

  useEffect(() => {
    fetchConfig().then((config) => {
      const ceramic = new Ceramic(apiHost);
      const idx = new IDX({
        ceramic,
        aliases: config.definitions,
      });
      idx.config = config;

      // Useful for debugging
      window.ceramic = ceramic;
      window.idx = idx;

      setCeramic({ ceramic, idx });
    });
  }, [apiHost]);

  return (
    <CeramicContext.Provider value={state}>
      {!state.idx ? "loading" : children}
    </CeramicContext.Provider>
  );
}

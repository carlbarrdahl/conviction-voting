import { ChakraProvider, Container } from "@chakra-ui/react";
import { HashRouter as Router, Switch, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";

import CeramicProvider, { useAuth } from "./providers/ceramic";

import Home from "./pages";
import Proposal from "./pages/Proposal";
import Proposals from "./pages/Proposals";
import CreateProposal from "./pages/CreateProposal";

import Header from "./components/Header";

function withProtected(Component) {
  return () => {
    const { did, isLoading } = useAuth();
    return (
      <>
        {isLoading ? (
          <pre>Loading auth...</pre>
        ) : !did ? (
          <pre>This page requires auth. Sign in to continue.</pre>
        ) : (
          <Component />
        )}
      </>
    );
  };
}

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CeramicProvider>
        <ChakraProvider>
          <Container maxW="container.xl">
            <Router>
              <Header />
              <Switch>
                <Route component={Home} exact path="/" />
                <Route component={Proposal} exact path="/proposals/:id" />
                <Route component={Proposals} exact path="/proposals" />
                <Route component={CreateProposal} exact path="/create" />
                {/* <Route component={withProtected(CreateProposal)} path="/create" /> */}
              </Switch>
            </Router>
          </Container>
        </ChakraProvider>
      </CeramicProvider>
    </QueryClientProvider>
  );
}

export default App;

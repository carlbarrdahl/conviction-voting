import { Alert, AlertIcon, Container, Heading, Text } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import ProposalForm from "../components/ProposalForm";
import { useCreateProposal } from "../hooks/proposals";
import { useCeramic } from "../providers/ceramic";

const CreateProposal = () => {
  const history = useHistory();
  const { idx } = useCeramic();
  const initialValues = {
    context: idx.config.context,
    amount: 100,
    title: "Develop an off-chain conviction voting system",
    currency: "ETH",
    amount: 200,
    beneficiary: "0xabcdef",
    description:
      "Fund team X to implement off-chain conviction voting using Ceramic & IDX.",
    url: "https://ceramic.network",
  };

  const { error, isLoading, mutateAsync: createProposal } = useCreateProposal();
  console.log(error, isLoading, createProposal);
  return (
    <Container maxW="xl">
      <Heading size="lg" mb={4}>
        Create new proposal
      </Heading>
      <Text mb={4}>
        Some informative text describing what it means to create a new proposal
        for conviction voting.
      </Text>
      {error && (
        <Alert status="error">
          <AlertIcon />
          {error.toString()}
        </Alert>
      )}

      <ProposalForm
        initialValues={initialValues}
        onSubmit={(values) =>
          createProposal(values).then((id) => {
            console.log(id, error);
            if (error) return;
            typeof id === "string" && history.push(`/proposals/${id}`);
          })
        }
      />
    </Container>
  );
};

export default CreateProposal;

import {
  Box,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useDocument } from "../hooks/proposals";

const Proposal = ({ match }) => {
  console.log("props", match.params);
  const { value, loading } = useDocument(match.params.id);

  if (loading) {
    return "...";
  }
  const totalConviction = 150;
  return (
    <SimpleGrid columns={2} spacing={8}>
      <Box>
        <Heading size="md" pb={2}>
          {value.title}
        </Heading>
        <Text pb={2}>Benfeficiary: {value.beneficiary}</Text>
        <Text pb={2}>{value.description}</Text>
        <Text color="blue.700">
          <a href={value.url} target="_blank">
            {value.url}
          </a>
        </Text>
      </Box>
      <Box>
        <Flex justifyContent="space-between" alignItems="center" mb={2}>
          <Heading size="sm">Community conviction</Heading>
          <Text>
            {totalConviction} / {value.amount}
          </Text>
        </Flex>
        <Progress size="lg" value={totalConviction} max={value.amount} />
      </Box>
    </SimpleGrid>
  );
};

export default Proposal;

import {
  Box,
  Heading,
  NumberInput,
  NumberInputField,
  Skeleton,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  useConvictions,
  useConvictionState,
  useCreateVote,
  useDocument,
} from "../../hooks/proposals";

const AllocationInput = ({ proposal, allocation }) => {
  const [{}, createVote] = useCreateVote();
  const [value, setValue] = useState(allocation);
  useEffect(() => {
    allocation && setValue(allocation);
  }, [allocation]);
  console.log("allocation", allocation);
  function handleAllocate(e) {
    const allocation = Number(e.target.value);
    setValue(e.target.value);
    if (!isNaN(allocation)) {
      console.log("Set conviction:", proposal, Number(e.target.value));
      createVote({ allocation, proposal: proposal });
    }
  }
  return (
    <NumberInput
      min={-1}
      max={1}
      step={0.01}
      precision={2}
      value={value}
      defaultValue={allocation}
    >
      <NumberInputField
        placeholder="0.1"
        id="allocation"
        onChange={handleAllocate}
      />
    </NumberInput>
  );
};
export const ProposalItem = ({
  proposal: id,
  totalConviction,
  convictions = [],
}) => {
  const { data: proposal, isLoading } = useDocument(id);
  const conviction = convictions.find((c) => c.proposal === id);
  if (isLoading) {
    return "";
  }

  return (
    <Tr>
      <Td>
        <Heading color="gray.600" size="lg" textAlign="center">
          {totalConviction}
        </Heading>
      </Td>
      <Td>
        <Heading size="md" mb={2}>
          {proposal.title}
        </Heading>{" "}
        <Text color="gray.700" fontSize="sm" pb={2}>
          {proposal.beneficiary}
        </Text>
        <Text mb={2}>{proposal.description}</Text>
        <Link to={proposal.url} target="_blank">
          <Text color="blue.700">{proposal.url}</Text>
        </Link>
      </Td>
      <Td>
        <Text fontSize="sm">
          {proposal.amount} {proposal.currency}
        </Text>
      </Td>
      <Td>
        <AllocationInput proposal={id} allocation={conviction?.allocation} />
      </Td>
    </Tr>
  );
};

const ProposalList = () => {
  let { data: { proposals = [] } = {}, isLoading } = useConvictionState();
  const { data: { convictions = [] } = {} } = useConvictions();
  console.log("convState", convictions);

  return (
    <>
      <Box>
        <Table>
          <Thead>
            <Tr>
              <Th width={30}>Conviction</Th>
              <Th>Proposal</Th>
              <Th width={40}>Resources</Th>
              <Th width={40}>My allocation</Th>
            </Tr>
          </Thead>

          <Tbody>
            {isLoading ? (
              <Tr>
                <Td>
                  <Skeleton width={20} children="..." />
                </Td>
                <Td>
                  <Skeleton children="..."></Skeleton>
                </Td>
                <Td>
                  <Skeleton children="..."></Skeleton>
                </Td>
                <Td>
                  <Skeleton children="..."></Skeleton>
                </Td>
              </Tr>
            ) : (
              proposals.map((proposal) => (
                <ProposalItem
                  key={proposal.proposal}
                  convictions={convictions}
                  {...proposal}
                />
              ))
            )}
          </Tbody>
        </Table>
      </Box>
    </>
  );
};

export default ProposalList;

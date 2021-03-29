import { Link } from "react-router-dom";
import { Box, Flex, Text, Button, Heading, Spinner } from "@chakra-ui/react";

import { useAuth, useCeramic } from "../../providers/ceramic";

const MenuItems = (props) => {
  const { children, isLast, to = "/", ...rest } = props;
  return (
    <Text mr={{ base: 0, sm: isLast ? 0 : 8 }} display="block" {...rest}>
      <Link to={to}>{children}</Link>
    </Text>
  );
};

const Header = (props) => {
  const { did, isLoading, signIn } = useAuth();
  console.log("auth", did, isLoading);
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      py={8}
      {...props}
    >
      <Flex align="center">
        <Heading size="md">Ceramic Voting</Heading>
      </Flex>

      <Box
        display={{ base: "block", md: "block" }}
        flexBasis={{ base: "100%", md: "auto" }}
      >
        <Flex
          align={["center", "center", "center", "center"]}
          justify={["center", "space-between", "flex-end", "flex-end"]}
          direction={["column", "row", "row", "row"]}
          pt={[4, 4, 0, 0]}
        >
          <MenuItems to="/">Home</MenuItems>
          <MenuItems to="/proposals">Proposals</MenuItems>
          {did ? (
            <MenuItems to="/create" isLast>
              <Button size="sm">Create proposal</Button>
            </MenuItems>
          ) : (
            <Button size="sm" onClick={() => signIn()} disabled={isLoading}>
              {isLoading ? "Signin in..." : "Sign in"}
            </Button>
          )}
        </Flex>
      </Box>
    </Flex>
  );
};

export default Header;

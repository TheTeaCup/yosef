import { Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";

export default function Unauthorized() {
  const router = useRouter();

  interface RedirectFunction {
    (path: string): void;
  }

  const redirect: RedirectFunction = (path: string) => {
    router.push(path);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.900" px={4}>
      <Box
        maxW="lg"
        w="full"
        bg="#2b2d31"
        p={8}
        rounded="xl"
        shadow="xl"
        textAlign="center"
        border="1px solid #1e1f22"
      >
        <Heading size="lg" mb={4} color="#ed4245">
          Access Denied
        </Heading>

        <Text fontSize="md" color="gray.300" mb={4}>
          You do not have permission to view this page. Your account may be
          missing the required role or access level.
        </Text>

        <Text fontSize="sm" color="gray.400" mb={6}>
          If you believe this is an error, please contact a server staff member
          or administrator for assistance.
        </Text>

        <Button
          bg="#5865F2"
          color="white"
          _hover={{ bg: "#4752c4" }}
          onClick={() => redirect("/logout")}
        >
          Logout
        </Button>
      </Box>
    </Flex>
  );
}

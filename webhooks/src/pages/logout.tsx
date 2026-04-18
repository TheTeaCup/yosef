import { Box, Flex, Spinner } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Logout() {
  const router = useRouter();

  useEffect(() => {
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("user");

    router.replace("/");
  }, [router]);

  return (
    <>
      <Head>
        <title>Logout - Yosef</title>
      </Head>

      <Flex
        minH="100vh"
        align="center"
        justify="center"
        bg="gray.900"
        color="white"
        px={6}
        textAlign="center"
      >
        <Box>
          <Spinner color="colorPalette.600" colorPalette="yellow" size="xl" />
        </Box>
      </Flex>
    </>
  );
}

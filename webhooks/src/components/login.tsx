import Head from "next/head";

import { Box, Button, Flex, Heading } from "@chakra-ui/react";

export default function Login() {
  const loginWithDiscord = () => {
    const redirectUri =
      typeof window !== "undefined"
        ? `${window.location.origin}/callback`
        : "http://localhost:3000/callback";

    const params = new URLSearchParams({
      client_id: "1489747568908042390",
      response_type: "code",
      redirect_uri: redirectUri,
      scope: "identify guilds email guilds.members.read",
      prompt: "none",
    });

    window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
  };

  return (
    <>
      <Head>
        <title>Login - Yosef</title>
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
          <Heading>Welcome to the AppState Discord Annoucements Portal</Heading>
          <Heading>To continue you need to login with Discord</Heading>
          <br />
          <Button
            onClick={async () => loginWithDiscord()}
            colorPalette="blue"
            variant="solid"
          >
            Discord Login
          </Button>
        </Box>
      </Flex>
    </>
  );
}

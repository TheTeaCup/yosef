import Head from "next/head";

import { Box, Button, Flex, Heading } from "@chakra-ui/react";

export default function JoinDiscord() {
  const joinOurDiscord = () => {
    window.location.href = "https://links.mountaineercraft.net/appstate";
  };

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
        <title>Join our Discord - Yosef</title>
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
          <Heading>To continue you need to join our Discord</Heading>
          <br />
          <Button
            onClick={async () => joinOurDiscord()}
            colorPalette="blue"
            variant="solid"
          >
            Discord Link
          </Button>
          <br />
          <Button
            mt="2"
            onClick={async () => loginWithDiscord()}
            colorPalette="gold"
            variant="solid"
          >
            Retry Login
          </Button>
        </Box>
      </Flex>
    </>
  );
}

import { Box, Button, Flex, Heading, HStack } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import JoinDiscord from "@/components/join-discord";
import Unauthorized from "@/components/unauthorized";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [joinOurDiscord, setJoinOurDiscord] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  // permission states
  const [eventsPerm, setEventsPerm] = useState(false);
  const [appalcartPerm, setAppalcartPerm] = useState(false);
  const [serverPerm, setServerPerm] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");

    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        setNeedLogin(true);
        return;
      }

      try {
        const res = await fetch(
          "https://yosef-api.hunterwilson.dev/auth/valid-token",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token }),
          },
        );

        const data = await res.json();

        if (data.valid) {
          setNeedLogin(false);
          if (!data.user.guildAccess) {
            setJoinOurDiscord(true);
          } else {
            setUser(data.user);
            console.log(data.user);

            const hasEvents = data.user.eventsRole;
            const hasAppalcart = data.user.appalcartAnnoucements;
            const hasServer = data.user.serverAnnoucements;

            setEventsPerm(hasEvents);
            setAppalcartPerm(hasAppalcart);
            setServerPerm(hasServer);

            setAuthorized(hasEvents || hasAppalcart || hasServer);
          }
        } else {
          sessionStorage.removeItem("auth_token");
          setNeedLogin(true);
        }
      } catch (err) {
        console.error("Token verification failed:", err);
        sessionStorage.removeItem("auth_token");
        setNeedLogin(true);
      } finally {
        setLoading(false);
      }
    };

    verifyToken();
  }, [router]);

  interface RedirectFunction {
    (path: string): void;
  }

  const redirect: RedirectFunction = (path: string) => {
    router.push(path);
  };

  if (loading) return <Loading />;

  if (error) return <Box>Error: {error}</Box>;

  if (needLogin) return <Login />;

  if (joinOurDiscord) return <JoinDiscord />;

  if (!authorized) return <Unauthorized />;

  return (
    <>
      <Head>
        <title>Home - Yosef</title>
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
          <Heading>Welcome, {user?.username || "Unknown"}!</Heading>
          <Heading>What would you like to Announce?</Heading>

          <br />
          <HStack>
            <Button
              colorPalette="blue"
              variant="solid"
              disabled={!eventsPerm}
              onClick={() => redirect("/annoucement/event")}
            >
              Upcoming Event
            </Button>
            <Button
              colorPalette="red"
              variant="solid"
              disabled={!appalcartPerm}
              onClick={() => redirect("/annoucement/appalcart")}
            >
              AppalCART Update
            </Button>
            <Button
              colorPalette="yellow"
              variant="solid"
              disabled={!serverPerm}
              onClick={() => redirect("/annoucement/server")}
            >
              Server Updates
            </Button>
          </HStack>

          <Button
            mt={6}
            colorPalette="pink"
            variant="solid"
            onClick={() => redirect("/logout")}
          >
            Logout
          </Button>
        </Box>
      </Flex>
    </>
  );
}

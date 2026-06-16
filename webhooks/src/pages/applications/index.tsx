import {
  Box,
  Flex,
  Button,
  Heading,
  HStack,
  Field,
  Input,
} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import { useRedirect } from "@/hooks/useRedirect";

export default function Applications() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = useRedirect();

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
            router.push("/");
          } else {
            setUser(data.user);
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

  //if (loading) return <Loading />;

  //if (error) return <Box>Error: {error}</Box>;

  //if (needLogin) return <Login />;

  return (
    <>
      <Head>
        <title>Applications - Yosef</title>
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
          <Heading>What would you like to Apply for?</Heading>

          <br />
          <HStack>
            <Button
              colorPalette="yellow"
              variant="solid"
              onClick={() => redirect("/applications/event-coordinator")}
            >
              Event Cordinator
            </Button>
            <Button
              colorPalette="red"
              variant="solid"
              onClick={() => redirect("/applications/staff")}
            >
              Staff Member
            </Button>
          </HStack>

          <Button
            mt={6}
            colorPalette="blue"
            variant="solid"
            onClick={() => redirect("/")}
          >
            Back Home
          </Button>
        </Box>
      </Flex>
    </>
  );
}

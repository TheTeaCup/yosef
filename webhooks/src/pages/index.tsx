import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import JoinDiscord from "@/components/join-discord";

export default function Home() {
  const router = useRouter();
  //const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [joinOurDiscord, setJoinOurDiscord] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");
  
    const verifyToken = async () => {
      if (!token) {
        setLoading(false);
        setNeedLogin(true);
        return;
      }
  
      try {
        const res = await fetch("http://localhost:3001/auth/valid-token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });
  
        const data = await res.json();
  
        if (data.valid) {
          setNeedLogin(false);
            if (!data.user.guildAccess) {
              setJoinOurDiscord(true);
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

  if (loading) return <Loading />;

  if (error) return <Box>Error: {error}</Box>;

  if (needLogin) return <Login />;

  if (joinOurDiscord) return <JoinDiscord />;

  return (
    <>
      wip
    </>
  );
}

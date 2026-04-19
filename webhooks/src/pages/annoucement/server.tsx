import { Box, Button, Flex, Heading, HStack } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import Unauthorized from "@/components/unauthorized";
import EmbedBuilder from "@/components/embedBuilder";
import { Embed, EmbedField } from "@/types/embed";

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // permission states
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
            router.push("/");
          } else {
            setUser(data.user);
            console.log(data.user);
            setServerPerm(data.user.serverAnnoucements);
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

  if (!serverPerm) return <Unauthorized />;

  const serverEmbed: Embed = {
    type: "server",
    content: "@AppalCART Role",
    embeds: [
      {
        title: "AppalCART Update",
        description:
          "*italics* or _italics_     __*underline italics*__\n**bold**     __**underline bold**__\n***bold italics***  __***underline bold italics***__\n__underline__     ~~Strikethrough~~",
        color: "#5865f2",
        thumbnail: {
          url: "/appalcart.png",
        },
        url: "https://appalcart.com",
        fields: [] as EmbedField[],
      },
    ],
  }

  return (
    <>
      <Head>
        <title>Home - Yosef</title>
      </Head>
      <EmbedBuilder defaultEmbed={serverEmbed}/>
    </>
  );
}

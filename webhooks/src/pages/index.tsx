import { Box, Button, Flex, Heading } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";

export default function Home() {
  const router = useRouter();
  //const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem("auth_token");

    if (token) {
      // check if token is valid by calling an API endpoint
    } else {
      setLoading(false);
      setNeedLogin(true);
    }
  }, [router]);

  if (loading) return <Loading />;

  if (error) return <Box>Error: {error}</Box>;

  if (needLogin) return <Login />;

  return (
    <>
      
    </>
  );
}

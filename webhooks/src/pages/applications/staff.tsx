import { Box, Flex, Field, Input } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";

export default function StaffApplication() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
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
        <title>Staff Application - Yosef</title>
      </Head>

      <Flex
        align="center"
        justify="center"
        color="white"
        px={6}
        textAlign="center"
      >
        <Box maxW="2xl">
          <Box fontSize="4xl" fontWeight="bold" mb={4}>
            Announcement Application
          </Box>
          <Box fontSize="lg" mb={6}>
            Thank you for your interest in becoming an announcer for our server!
            We are looking for dedicated individuals to help keep our community
            informed about upcoming events and news.
          </Box>
          <Box fontSize="lg" mb={6}>
            To apply, please fill out the application form below. We will review
            your application and get back to you as soon as possible.
          </Box>
          <Box>
            <Field.Root required>
              <Field.Label>
                Email <Field.RequiredIndicator />
              </Field.Label>
              <Input placeholder="Enter your email" />
              <Field.HelperText>
                Provide an @appstate.edu email
              </Field.HelperText>
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                Name <Field.RequiredIndicator />
              </Field.Label>
              <Input placeholder="Enter your name" />
            </Field.Root>
          </Box>
        </Box>
      </Flex>
    </>
  );
}

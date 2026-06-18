import { Box, Flex, Field, Input, HStack, Button } from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import { useRedirect } from "@/hooks/useRedirect";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function EventCoordinator() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = useRedirect();

  const [form, setForm] = useState({
    type: "eventCoordinator",
    email: "",
    name: "",
    organization: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const updateField = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

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

  const submitApplication = async () => {
    try {
      setSubmitting(true);

      const response = await fetch(
        "https://yosef-api.hunterwilson.dev/applications/event",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            form,
            token: sessionStorage.getItem("auth_token"),
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        toaster.create({
          description: data.message,
          type: "success",
          closable: true,
        });

        // Optional: clear form after successful submission
        // setForm(initialFormState);

        return;
      }

      const validationErrors =
        data.issues
          ?.map(
            (issue: { field: string; message: string }) =>
              `${issue.field}: ${issue.message}`,
          )
          .join("\n") ?? data.message;

      toaster.create({
        description: validationErrors,
        type: "error",
        closable: true,
      });
    } catch (err) {
      console.error("Application submission failed:", err);

      toaster.create({
        description:
          "An error occurred while submitting your application. Please try again later.",
        type: "error",
        closable: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  //if (loading) return <Loading />;

  //if (error) return <Box>Error: {error}</Box>;

  //if (needLogin) return <Login />;

  return (
    <>
      <Toaster />
      <Head>
        <title>Event Coordinator Application - Yosef</title>
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
        <Box maxW="2xl">
          <Box fontSize="4xl" fontWeight="bold" mb={4}>
            Event Coordinator Application
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
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="Enter your email"
              />
              <Field.HelperText>
                Provide an @appstate.edu email
              </Field.HelperText>
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                Name <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="Enter your name"
              />
              <Field.HelperText>First and Last name please.</Field.HelperText>
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                Organization <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.organization}
                onChange={(e) => updateField("organization", e.target.value)}
                placeholder="Example: APPS"
              />
              <Field.HelperText>
                What organization will you be posting for?
              </Field.HelperText>
            </Field.Root>
          </Box>
          <HStack mt={5} w="100%" justify="flex-end">
            <Button
              loading={submitting}
              onClick={submitApplication}
              colorPalette="yellow"
              variant="solid"
            >
              Submit
            </Button>

            <Button
              colorPalette="red"
              variant="solid"
              onClick={() => redirect("/applications")}
            >
              Cancel
            </Button>
          </HStack>
        </Box>
      </Flex>
    </>
  );
}

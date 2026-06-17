import {
  Box,
  Flex,
  Field,
  Input,
  Button,
  HStack,
  Heading,
  Text,
  Textarea,
} from "@chakra-ui/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Loading from "@/components/loading";
import Login from "@/components/login";
import { useRedirect } from "@/hooks/useRedirect";
import { Toaster, toaster } from "@/components/ui/toaster";

export default function StaffApplication() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const redirect = useRedirect();

  const [form, setForm] = useState({
    type: "staffMember",
    email: "",
    name: "",
    linkedin: "",
    hoursPerWeek: "",
    onlineTimes: "",
    whyStaff: "",
    argumentativeMember: "",
    staffMisconduct: "",
    memberDispute: "",
    additionalInfo: "",
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
        "https://yosef-api.hunterwilson.dev/applications/staff",
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

  if (loading) return <Loading />;

  if (error) return <Box>Error: {error}</Box>;

  if (needLogin) return <Login />;

  return (
    <>
      <Toaster />
      <Head>
        <title>Staff Application - Yosef</title>
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
        <Box mb={5} mt={5} maxW="2xl">
          <Box fontSize="4xl" fontWeight="bold" mb={4}>
            Staff Application
          </Box>

          <Box fontSize="lg" mb={6}>
            Thank you for your interest in joining our staff team. We are
            looking for responsible, active, and community-focused individuals
            who can help maintain a welcoming environment, assist members, and
            support the continued growth of our server.
          </Box>

          <Box textAlign="left">
            <Heading size="lg" mb={4}>
              Basic Information
            </Heading>

            <Field.Root required>
              <Field.Label>
                Email <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="name@appstate.edu"
              />
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                Name <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.name}
                onChange={(e) => updateField("name", e.target.value)}
                placeholder="First and Last Name"
              />
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                LinkedIn <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.linkedin}
                onChange={(e) => updateField("linkedin", e.target.value)}
                placeholder="https://linkedin.com/in/yourprofile"
              />
            </Field.Root>

            <Heading size="lg" mt={10} mb={4}>
              Availability
            </Heading>

            <Field.Root required>
              <Field.Label>
                How many hours per week can you actively dedicate to staff
                duties?
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.hoursPerWeek}
                onChange={(e) => updateField("hoursPerWeek", e.target.value)}
                placeholder="Example: 5-10 hours"
              />
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                What times are you typically online?
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={form.onlineTimes}
                onChange={(e) => updateField("onlineTimes", e.target.value)}
                placeholder="Weekdays 6 PM - 10 PM EST"
              />
            </Field.Root>

            <Heading size="lg" mt={10} mb={4}>
              Application Questions
            </Heading>

            <Field.Root required>
              <Field.Label>
                Why do you want to become a staff member?
                <Field.RequiredIndicator />
              </Field.Label>
              <Textarea
                value={form.whyStaff}
                onChange={(e) => updateField("whyStaff", e.target.value)}
                minH="120px"
                placeholder="Tell us why you're interested in helping the community..."
              />
            </Field.Root>

            <Heading size="lg" mt={10} mb={4}>
              Situational Questions
            </Heading>

            <Field.Root required>
              <Field.Label>
                A member becomes argumentative and starts insulting others in a
                public channel. How would you handle the situation?
                <Field.RequiredIndicator />
              </Field.Label>
              <Textarea
                value={form.argumentativeMember}
                onChange={(e) =>
                  updateField("argumentativeMember", e.target.value)
                }
                minH="120px"
                placeholder="Describe how you would de-escalate the situation..."
              />
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                You notice another staff member acting unprofessionally. What
                would you do?
                <Field.RequiredIndicator />
              </Field.Label>
              <Textarea
                value={form.staffMisconduct}
                onChange={(e) => updateField("staffMisconduct", e.target.value)}
                minH="120px"
                placeholder="Explain how you would address the issue..."
              />
            </Field.Root>

            <Field.Root mt={5} required>
              <Field.Label>
                Two members are involved in a disagreement and both claim the
                other started it. How would you approach resolving the issue?
                <Field.RequiredIndicator />
              </Field.Label>
              <Textarea
                value={form.memberDispute}
                onChange={(e) => updateField("memberDispute", e.target.value)}
                minH="120px"
                placeholder="Walk us through your process..."
              />
            </Field.Root>

            <Heading size="lg" mt={10} mb={4}>
              Additional Information
            </Heading>

            <Field.Root>
              <Field.Label>
                Is there anything else you would like us to know?
              </Field.Label>
              <Textarea
                value={form.additionalInfo}
                onChange={(e) => updateField("additionalInfo", e.target.value)}
                minH="120px"
                placeholder="Anything else you'd like the staff team to consider..."
              />
            </Field.Root>
          </Box>

          <HStack mt={8} justify="flex-end">
            <Button
              loading={submitting}
              onClick={submitApplication}
              colorPalette="yellow"
            >
              Submit
            </Button>

            <Button
              colorPalette="red"
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

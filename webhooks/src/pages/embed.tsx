import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
  Code,
  Field,
} from "@chakra-ui/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import remarkBreaks from "remark-breaks";
import { useState } from "react";

type Field = {
  name: string;
  value: string;
  inline: boolean;
};

type Embed = {
  content: string;
  embeds: {
    title: string;

    description: string;
    color: string;

    url?: string;

    author: {
      name: string;
      icon_url?: string;
      url?: string;
    };

    footer: {
      text: string;
      icon_url?: string;
    };

    thumbnail?: {
      url: string;
    };

    image?: {
      url: string;
    };

    timestamp?: string;

    fields: Field[];
  }[];
};

function preprocessDiscord(text: string): string {
  return text
    .replace(/\\n/g, "\n") // ensure escaped \n works
    .replace(/__(.*?)__/g, "<u>$1</u>");
}

function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      rehypePlugins={[rehypeRaw]}
      components={{
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            style={{
              color: "#00a8fc",
              textDecoration: "none",
            }}
          >
            {children}
          </a>
        ),
        p: ({ children }) => (
          <Text mb={0} lineHeight="1.35">
            {children}
          </Text>
        ),
        strong: ({ children }) => (
          <Text as="span" fontWeight="700">
            {children}
          </Text>
        ),
        em: ({ children }) => (
          <Text as="span" fontStyle="italic">
            {children}
          </Text>
        ),
        del: ({ children }) => (
          <Text as="span" textDecoration="line-through">
            {children}
          </Text>
        ),
      }}
    >
      {preprocessDiscord(content)}
    </ReactMarkdown>
  );
}

export default function EmbedBuilder() {
  const [embed, setEmbed] = useState<Embed>({
    content: "Message outside of the Embed",
    embeds: [
      {
        title: "Title of Embed",
        description:
          "*italics* or _italics_     __*underline italics*__\n**bold**     __**underline bold**__\n***bold italics***  __***underline bold italics***__\n__underline__     ~~Strikethrough~~\nEvent Social Link: [Click Here](https://engage.appstate.edu)",
        color: "#5865f2",
        footer: {
          text: "Footer Text",
          icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        author: {
          name: "Author Name",
          icon_url: "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        image: {
          url: "https://glitchii.github.io/embedbuilder/assets/media/banner.png",
        },
        thumbnail: {
          url: "https://cdn.discordapp.com/embed/avatars/0.png",
        },
        url: "https://engage.appstate.edu",
        fields: [] as Field[],
      },
    ],
  });

  const updateEmbed = (path: string, value: any) => {
    setEmbed((prev) => {
      const copy = structuredClone(prev);
      const keys = path.split(".");

      let obj: any = copy.embeds[0];

      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }

      obj[keys[keys.length - 1]] = value;

      return copy;
    });
  };

  const addField = () => {
    setEmbed((prev) => ({
      ...prev,
      embeds: [
        {
          ...prev.embeds[0],
          fields: [
            ...prev.embeds[0].fields,
            { name: "Field", value: "Value", inline: false },
          ],
        },
      ],
    }));
  };

  const updateField = (
    index: number,
    key: keyof Field,
    value: string | boolean,
  ) => {
    const fields = [...embed.embeds[0].fields];
    fields[index] = { ...fields[index], [key]: value };

    setEmbed({
      ...embed,
      embeds: [{ ...embed.embeds[0], fields }],
    });
  };

  const removeField = (index: number) => {
    const fields = embed.embeds[0].fields.filter((_, i) => i !== index);
    setEmbed({
      ...embed,
      embeds: [{ ...embed.embeds[0], fields }],
    });
  };

  const sendEmbed = async () => {
    await fetch("api.call.yayayaya", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(embed),
    });
  };

  const copyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(embed, null, 2));
  };

  const e = embed.embeds[0];

  return (
    <HStack align="start" p={6} bg="gray.900" minH="100vh">
      {/* LEFT: Editor */}
      <VStack w="50%" gap={3} align="stretch">
        <Text fontSize="xl" fontWeight="bold" color="white">
          Embed Builder
        </Text>

        <Field.Root>
          <Field.Label>Content (message above embed)</Field.Label>
          <Input
            defaultValue={embed.content}
            onChange={(e) => setEmbed({ ...embed, content: e.target.value })}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Author Name</Field.Label>
          <Input
            defaultValue={e.author.name}
            onChange={(e) => updateEmbed("author.name", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Author Icon URL</Field.Label>
          <Input
            defaultValue={e.author.icon_url}
            onChange={(e) => updateEmbed("author.icon_url", e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Title <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={e.title}
            onChange={(e) => updateEmbed("title.text", e.target.value)}
          />
        </Field.Root>

        <Field.Root required>
          <Field.Label>
            Embed URL <Field.RequiredIndicator />
          </Field.Label>
          <Input
            defaultValue={e.url}
            onChange={(e) => updateEmbed("url", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Description</Field.Label>
          <Textarea
            defaultValue={e.description}
            onChange={(e) => updateEmbed("description", e.target.value)}
            autoresize
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Thumbnail URL</Field.Label>
          <Input
            defaultValue={e.thumbnail?.url}
            onChange={(e) => updateEmbed("thumbnail.url", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Image URL</Field.Label>
          <Input
            defaultValue={e.image?.url}
            onChange={(e) => updateEmbed("image.url", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Footer Text</Field.Label>
          <Input
            defaultValue={e.footer.text}
            onChange={(e) => updateEmbed("footer.text", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Footer Icon URL</Field.Label>
          <Input
            defaultValue={e.footer.icon_url}
            onChange={(e) => updateEmbed("footer.icon_url", e.target.value)}
          />
        </Field.Root>

        <Field.Root>
          <Field.Label>Embed Color</Field.Label>
          <Input
            type="color"
            defaultValue={e.color}
            onChange={(e) =>
              updateEmbed(
                "color",
                parseInt(e.target.value.replace("#", ""), 16),
              )
            }
          />
        </Field.Root>

        <Button onClick={addField} colorPalette="green">
          + Add Field
        </Button>

        {e.fields.map((f, i) => (
          <Box key={i} p={3} bg="gray.800" borderRadius="md">
            <Input
              placeholder="Field Name"
              value={f.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <Input
              placeholder="Field Value"
              value={f.value}
              onChange={(e) => updateField(i, "value", e.target.value)}
              mt={2}
            />
            <HStack mt={2}>
              <Button
                size="sm"
                onClick={() => updateField(i, "inline", !f.inline)}
              >
                Inline: {f.inline ? "Yes" : "No"}
              </Button>

              <Button
                size="sm"
                colorPalette="red"
                onClick={() => removeField(i)}
              >
                Remove
              </Button>
            </HStack>
          </Box>
        ))}

        <HStack>
          <Button colorPalette="blue" onClick={sendEmbed}>
            Send
          </Button>
        </HStack>
      </VStack>

      {/* RIGHT: Preview */}
      <Box w="50%" bg="gray.800" p={4} borderRadius="md">
        <Text color="gray.400" mb={2}>
          Preview
        </Text>

        {embed.content && <Text mb={2}>{embed.content}</Text>}

        <Box
          borderLeft="4px solid"
          borderColor={
            e.color.startsWith("#")
              ? e.color
              : `#${Number(e.color).toString(16).padStart(6, "0")}`
          }
          bg="#2b2d31"
          p={4}
          borderRadius="md"
          maxW="100%"
          fontSize="sm"
          lineHeight="1.35"
        >
          {e.author?.name && (
            <HStack mb={2}>
              {e.author.icon_url && (
                <img
                  src={e.author.icon_url}
                  width={20}
                  height={20}
                  style={{ borderRadius: "50%" }}
                />
              )}
              <Text fontSize="xs" color="gray.300">
                {e.author.name}
              </Text>
            </HStack>
          )}

          {e.thumbnail?.url && (
            <Box float="right" ml={3} mt={1}>
              <img
                src={e.thumbnail.url}
                width={60}
                height={60}
                style={{ borderRadius: 6 }}
              />
            </Box>
          )}

          {e.title && (
            <Text fontSize="md" fontWeight="700" mb={2}>
              {e.url ? (
                <a href={e.url} style={{ color: "#00a8fc" }} target="_blank">
                  {e.title}
                </a>
              ) : (
                e.title
              )}
            </Text>
          )}

          {e.description && (
            <Box mb={2}>
              <MarkdownPreview content={e.description} />
            </Box>
          )}

          {e.fields.length > 0 && (
            <Box
              mt={3}
              display="grid"
              gridTemplateColumns="repeat(3, 1fr)"
              gap={3}
            >
              {e.fields.map((f, i) => (
                <Box key={i}>
                  <Text fontWeight="700" fontSize="sm">
                    {f.name}
                  </Text>
                  <Text fontSize="sm" color="gray.300" whiteSpace="pre-wrap">
                    {f.value}
                  </Text>
                </Box>
              ))}
            </Box>
          )}

          {e.image?.url && (
            <Box mt={2}>
              <img
                src={e.image.url}
                style={{
                  maxWidth: "100%",
                  maxHeight: 400,
                  width: "auto",
                  height: "auto",
                  borderRadius: 6,
                  objectFit: "contain",
                }}
              />
            </Box>
          )}

          {e.footer.text && (
            <HStack mt={3}>
              {e.footer.icon_url && (
                <img
                  src={e.footer.icon_url}
                  width={14}
                  height={14}
                  style={{ borderRadius: "50%" }}
                />
              )}

              <Text fontSize="xs">{e.footer.text}</Text>
            </HStack>
          )}
        </Box>
      </Box>
    </HStack>
  );
}

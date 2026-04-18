import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Text,
} from "@chakra-ui/react";
import { useState } from "react";

type Field = {
  name: string;
  value: string;
  inline: boolean;
};

export default function EmbedBuilder() {
  const [embed, setEmbed] = useState({
    content: "",
    embeds: [
      {
        title: "",
        description: "",
        color: 0x5865f2,
        footer: { text: "" },
        author: { name: "" },
        fields: [] as Field[],
      },
    ],
  });

  const updateEmbed = (path: string, value: any) => {
    setEmbed((prev) => {
      const copy = { ...prev } as any;
      copy.embeds[0][path] = value;
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

        <Input
          placeholder="Content (message above embed)"
          onChange={(e) => setEmbed({ ...embed, content: e.target.value })}
        />

        <Input
          placeholder="Author"
          onChange={(e) => updateEmbed("author", { name: e.target.value })}
        />

        <Input
          placeholder="Title"
          onChange={(e) => updateEmbed("title", e.target.value)}
        />

        <Textarea
          placeholder="Description"
          onChange={(e) => updateEmbed("description", e.target.value)}
        />

        <Input
          placeholder="Footer"
          onChange={(e) => updateEmbed("footer", { text: e.target.value })}
        />

        <Input
          type="color"
          onChange={(e) =>
            updateEmbed("color", parseInt(e.target.value.replace("#", ""), 16))
          }
        />

        <Button onClick={addField} colorScheme="green">
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
                colorScheme="red"
                onClick={() => removeField(i)}
              >
                Remove
              </Button>
            </HStack>
          </Box>
        ))}

        <HStack>
          <Button colorScheme="blue" onClick={sendEmbed}>
            Send
          </Button>
          <Button onClick={copyJSON}>Copy JSON</Button>
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
          borderColor={`#${e.color.toString(16)}`}
          bg="gray.700"
          p={4}
          borderRadius="md"
        >
          {e.author.name && (
            <Text fontSize="sm" color="gray.300">
              {e.author.name}
            </Text>
          )}

          {e.title && (
            <Text fontWeight="bold" fontSize="lg">
              {e.title}
            </Text>
          )}

          {e.description && (
            <Text mt={2} color="gray.300">
              {e.description}
            </Text>
          )}

          {e.fields.length > 0 && (
            <Box mt={3}>
              {e.fields.map((f, i) => (
                <Box key={i} mt={2}>
                  <Text fontWeight="bold">{f.name}</Text>
                  <Text color="gray.300">{f.value}</Text>
                </Box>
              ))}
            </Box>
          )}

          {e.footer.text && (
            <Text mt={3} fontSize="xs" color="gray.500">
              {e.footer.text}
            </Text>
          )}
        </Box>
      </Box>
    </HStack>
  );
}

type EmbedField = {
  name: string;
  value: string;
  inline: boolean;
};

type Embed = {
  content?: string;
  type?: "event" | "appalcart" | "server";
  embeds: {
    title?: string;

    description?: string;
    color?: string;

    url?: string;

    author?: {
      name?: string;
      icon_url?: string;
      url?: string;
    };

    footer?: {
      text?: string;
      icon_url?: string;
    };

    thumbnail?: {
      url: string;
    };

    image?: {
      url: string;
    };

    timestamp?: string;

    fields?: EmbedField[];
  }[];
};

export { type EmbedField, type Embed };

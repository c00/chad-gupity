import OpenAI, { ClientOptions } from "openai";
import { ChatCompletionMessageParam } from "openai/resources";

export class OpenAiClient {
  configuration: ClientOptions;
  openai: OpenAI;
  verbose = !!process.env.VERBOSE;

  systemMessage =
    process.env.GPT_SYSTEM_MESSAGE || "You are a helpful SlackBot";

  constructor(apiKey: string) {
    this.configuration = {
      apiKey,
    };
    this.openai = new OpenAI(this.configuration);
  }

  async getImage(prompt: string): Promise<string> {
    const response = await this.openai.images.generate({
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024",
    });

    if (this.verbose) console.log("Response", response.data);
    return response.data[0].url;
  }

  async getChat(input: ChatInput[], useGpt4 = false): Promise<string> {
    const messages = createMessages(input);

    if (this.verbose) {
      if (useGpt4) {
        console.log("Using GPT-4");
      } else {
        console.log("Using GPT-3.5");
      }
    }

    const completion = await this.openai.chat.completions.create({
      model: useGpt4 ? "gpt-4o" : "gpt-3.5-turbo",
      messages: [{ role: "system", content: this.systemMessage }, ...messages],
    });

    if (!completion.choices[0].message) {
      throw new Error("No response from OpenAi");
    }

    return completion.choices[0].message.content;
  }
}

function createMessages(input: ChatInput[]): ChatCompletionMessageParam[] {
  if (!input) return [];

  return input.map((i) => {
    if (typeof i === "string") return { role: "user", content: i.trim() };
    return i;
  });
}

export type ChatInput = string | ChatCompletionMessageParam;

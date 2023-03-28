import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from "openai";

export class OpenAiClient {
  configuration: Configuration;
  openai: OpenAIApi;

  systemMessage = "You are a helpful SlackBot";

  constructor(apiKey: string) {
    this.configuration = new Configuration({
      apiKey,
    });
    this.openai = new OpenAIApi(this.configuration);
  }

  async getImage(prompt: string): Promise<string> {
    const response = await this.openai.createImage({
      prompt,
      size: "512x512",
    });

    console.log("Response", response.data);
    return response.data.data[0].url;
  }

  async getChat(input: string[]): Promise<string> {
    const messages: ChatCompletionRequestMessage[] = input.map((m) => ({
      role: "user",
      content: m,
    }));

    const completion = await this.openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [{ role: "system", content: this.systemMessage }, ...messages],
    });

    if (!completion.data.choices[0].message) {
      throw new Error("No response from OpenAi");
    }

    return completion.data.choices[0].message.content;
  }
}

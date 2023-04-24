import { App, GenericMessageEvent, SayFn } from "@slack/bolt";
import { ChatInput, OpenAiClient } from "./OpenAi";
import { ChatCompletionRequestMessage } from "openai";

export class SlackBotApp {
  app: App;
  botUserId: string;
  openai: OpenAiClient;

  constructor() {
    this.app = new App({
      signingSecret: process.env.SLACK_SIGNING_SECRET,
      appToken: process.env.SLACK_APP_TOKEN,
      token: process.env.SLACK_BOT_TOKEN,
      socketMode: true,
    });
    this.openai = new OpenAiClient(process.env.OPENAI_KEY);
  }

  async init() {
    await this.setBotUserId();
    this.setupCallbacks();
    return this.app.start();
  }

  private stripFluff(text: string) {
    return text
      .replace(`<@${this.botUserId}>`, "")
      .replace("--v4", "")
      .replace("--gpt4", "")
      .trim();
  }

  private async respondWithChatCompletion(m: GenericMessageEvent, say: SayFn) {
    const useGpt4 = m.text.includes("--gpt4") || m.text.includes("--v4");
    const text = this.stripFluff(m.text);

    console.log("Receiving message:", text);

    const prompts: ChatInput[] = [];

    // If the message is a top level comment
    if (!m.thread_ts) {
      prompts.push(text);
    } else {
      // Get all the messages in the thread
      const conversationId = m.channel;
      const threadId = m.thread_ts;

      const result = await this.app.client.conversations.replies({
        channel: conversationId,
        ts: threadId,
      });
      const messages = result.messages || [];

      const input: ChatCompletionRequestMessage[] = messages.map((m) => ({
        role: m.user === this.botUserId ? "assistant" : "user",
        content: this.stripFluff(m.text),
      }));

      prompts.push(...input);
    }

    try {
      const response = await this.openai.getChat(prompts, useGpt4);

      say({
        text: response,
        thread_ts: m.thread_ts || m.ts,
      });
    } catch (error) {
      console.error(error);
      // Handle any errors that may occur
      await say({
        text: "Oops! Something went wrong. Please try again later.",
        thread_ts: m.thread_ts || m.ts,
      }).catch(() => {
        console.error("Even the error went wrong.");
      });
    }
  }

  private setupCallbacks() {
    this.app.message(async ({ message, say }) => {
      const m = message as GenericMessageEvent;

      if (m.channel_type === "im") await this.respondWithChatCompletion(m, say);
    });

    this.app.message(`<@${this.botUserId}>`, async ({ say, message }) => {
      const m = message as GenericMessageEvent;

      await this.respondWithChatCompletion(m, say);
    });

    this.app.command("/image", async ({ command, ack, say }) => {
      console.log("Generating image", command.text);
      try {
        // Acknowledge the command request
        await ack();

        const text = command.text.replace(`<@${this.botUserId}>`, "").trim();
        const image_url = await this.openai.getImage(text);

        say({
          text: "Here it is!",
          blocks: [
            {
              type: "image",
              title: {
                type: "plain_text",
                text,
              },
              image_url,
              alt_text: text,
            },
          ],
          channel: command.channel_id,
        });
      } catch (error) {
        console.error(error);
        // Handle any errors that may occur
        await say({
          text: "Oops! Something went wrong. Please try again later.",
          channel: command.channel_id,
        }).catch(() => {
          console.error("Even the error went wrong.");
        });
      }
    });
  }

  private async setBotUserId(): Promise<void> {
    const authResult = await this.app.client.auth.test({
      token: process.env.SLACK_BOT_TOKEN,
    });
    this.botUserId = authResult.user_id;
  }
}

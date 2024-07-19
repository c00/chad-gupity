# A ChatGPT Slackbot

This is a very simple slackbot that uses the openAI API with chatGPT. It was put together in very little time with very little effort, so don't expect great things.

## Setup your Slack Workspace

You will need to setup an app with Slack first. Go to [api.slack.com/apps](https://api.slack.com/apps/) and create a new App.

Subscribe it to the following events:

- `app_mention` - To respond to mentions
- `message.channels` - To respond in Channels
- `message.groups` - To respons in groups
- `message.im` - To respond in private messages

It should have the following Scopes under "oauth & permissions":

- `app_mentions:read`
- `channels:history`
- `chat:write`
- `groups:history`
- `im:history`
- `im:read`

Write down your Slack App Token, Slack Bot Token and Slack Signing Secret. You will need those for the environment variables.

## Setup the OpenAI API

Go to [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) and create an API key. You will need that for the environment variable `OPENAI_KEY`.

## Make it work

Create a `.env` file with the following content:

```
OPENAI_KEY=yourkeyhere
SLACK_APP_TOKEN=yourkeyhere
SLACK_BOT_TOKEN=yourkeyhere
SLACK_SIGNING_SECRET=yourkeyhere
STRONG_MODEL=gpt-4o
FAST_MODEL=gpt-4o-mini
```

Install dependencies:

```bash
pnpm i
```

Start the app:

```bash
pnpm start
```

## Build for docker

```bash
docker build . -t thechadster
```

## How to use it?

In slack, you can either add it to public or private channels, or you can talk to it in private messages.

In channels (public and private) it will only respond if you tag the bot user. It is necessary to invite the bot into the channel before this works. You can do that by doing `/invite @botname`.

In private messages with the bot, tagging is not necessary. It will respond to each message.

The bot will respond to you in the thread. If the message was a root-level message, it will create the thread. If you interact with the bot from a thread, the entire thread will be fed into chatGPT to give a more coherent response.

## Using GPT-4

Add `--v4` or `--gpt4` to any of your messages and it will use `gpt-4` to get an answer. By default it uses `gpt-3.5-turbo`.

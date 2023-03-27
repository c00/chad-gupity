# A ChatGPT Slackbot

This is a very simple slackbot that uses the openAI API with chatGPT.

## Make it work

Create a `.env` file with the following content:

```
OPENAI_KEY=yourkeyhere
SLACK_APP_TOKEN=yourkeyhere
SLACK_BOT_TOKEN=yourkeyhere
SLACK_SIGNING_SECRET=yourkeyhere
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
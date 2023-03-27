import dotenv from "dotenv";
import { SlackBotApp } from "./SlackBotApp";

dotenv.config();

const bot = new SlackBotApp();
bot
  .init()
  .then(() => {
    console.log("Chad is here for you, baby.");
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

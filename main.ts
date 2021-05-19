import * as Discord from "discord.js";
const client = new Discord.Client();
import { commands, help } from "./commands";

client.on("ready", () => {
  console.log(`Bot running...`);
});

client.on("message", (msg) => {
  try {
    if (msg.author.bot) return;
    if (!msg.content.startsWith("!fuel")) return;
    let foundCmd = false;
    console.log(`${msg.content} from ${msg.author.username}`);
    commands.forEach((cmd) => {
      if (msg.content.startsWith(cmd.prefix)) {
        foundCmd = true;
        msg.reply(cmd.reply(msg.content));
      }
    });

    if (!foundCmd) {
      msg.reply(help.reply(msg.content));
    }
  } catch (err) {
    msg.reply(err.message);
  }
});

client.login(process.env.DISCORD_TOKEN);

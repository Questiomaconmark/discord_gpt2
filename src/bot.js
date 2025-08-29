const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require("../config.json")
const { getAIResponse, getAllConversations } = require("./ai")
const { randomDelay } = require("./utils");
const { saveConversations } = require("./serial");

const targetsByChannel = {
  "1410098965298282567": ['163327176861679616', '351847001492684811'], // test server
};

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

client.on("messageCreate", async (message) => {
  const allowedTargets = targetsByChannel[message.channel.id];

  let userMessage = message.content
  if (message.content.length === 0) userMessage = " "

  if (allowedTargets && allowedTargets.includes(message.author.id)) {
    try {
      const aiReply = await getAIResponse(message.author.id, userMessage);
      if (!aiReply) return;

      const delay = randomDelay(5000, 10000);
      console.log(Date.now() + ` Delaying reply by ${delay / 1000} seconds...`);
      setTimeout(async () => { message.reply(aiReply) }, delay);
    } catch (error) {
      console.error("Error handling message:", error);
      message.reply("Something went wrong");
    }
  }
  else
    return;
});

process.on("SIGTERM", () => {
  saveConversations(getAllConversations());
  process.exit();
});

process.on("SIGINT", () => {
    saveConversations(getAllConversations());
    process.exit();
});

client.login(token);

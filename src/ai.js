const OpenAI = require('openai');
const { openrouterkey } = require('../config.json');
const { fetchWithRetry } = require('./utils');
const { loadConversations } = require('./serial.js')

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: openrouterkey
});

let conversations = loadConversations();

const TOKEN_BUDGET = 100000;
let totalTokensUsed = 0;

const prompt = "Pretend to be Elon Musk for comedy. Speak thoughtfully but with awkward pauses and occasional rambling. Jump rapidly between futuristic innovations and odd personal insights. Sound passionate but a little scattered, like an absent-minded genius. Use overly technical language mixed with casual slang, and drop in unexpected product pitches or references to space, AI, and electric cars. Make it sound like an eccentric inventor giving a TED Talk while half daydreaming";
const customErrMessage = "Something went wrong";

function addMessage(userID, role, content) {
  if (!conversations[userID]) conversations[userID] = [];
  conversations[userID].push({ role, content });

  if (conversations[userID].length > 10) {
    conversations[userID] = conversations[userID].slice(-10);
  }
}

function getConversation(userID) {
  return conversations[userID] || [];
}

async function getAIResponse(userID, userMessage) {
  addMessage(userID, "user", userMessage);

  const messages = [
    {
      role: "system",
      content: prompt
    },
    ...getConversation(userID),
  ];

  if (totalTokensUsed >= TOKEN_BUDGET) {
    console.log("Token budget reached. Bot will no longer respond.");
    return null;
  }

  try {
    const response = await fetchWithRetry(() =>
      openai.chat.completions.create({
        model: "deepseek/deepseek-chat-v3.1",
        messages: messages,
        extra_body: { usage: { include: true } },
      })
    );

    const aiReply = response.choices[0].message.content;
    addMessage(userID, "assistant", aiReply);

    const inputTokens = response.usage?.prompt_tokens ?? 0;
    const outputTokens = response.usage?.completion_tokens ?? 0;
    const totalTokens = response.usage?.total_tokens ?? (inputTokens + outputTokens);
    const costInput = (inputTokens / 1_000_000) * 0.20;
    const costOutput = (outputTokens / 1_000_000) * 0.80;
    const totalCost = costInput + costOutput;
    const costPerToken = totalCost / totalTokens;

    totalTokensUsed += totalTokens;
    const remainingTokens = TOKEN_BUDGET - totalTokensUsed;

    console.log(`Message processed. Tokens used: ${totalTokens} (Input: ${inputTokens}, Output: ${outputTokens})`);
    console.log(`Total tokens used: ${totalTokensUsed}`);
    console.log(`Remaining tokens: ${remainingTokens}`);
    console.log(`Estimated spent: $${totalCost.toFixed(5)}`);
    console.log(`Cost per token: $${costPerToken.toFixed(6)}`);

    return aiReply;
  } catch (err) {
    console.error("AI error", err)
    return customErrMessage;
  }
}

function getAllConversations() {
  return conversations
}

module.exports = { getAIResponse, conversations, getAllConversations }

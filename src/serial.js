const fs = require("fs");
const path = require("path");

const conversationsFile = path.join(__dirname, "../conversations.json");

function saveConversations(conversations) {
  try {
    fs.writeFileSync(conversationsFile, JSON.stringify(conversations, null, 2));
    console.log("Conversations saved.");
  } catch (err) {
    console.error("Failed to save conversations:", err);
  }
}

function loadConversations() {
  if (fs.existsSync(conversationsFile)) {
    try {
      const data = fs.readFileSync(conversationsFile, "utf8");
      console.log("Conversations loaded.");
      return JSON.parse(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    }
  }
  return {};
}

module.exports = { saveConversations, loadConversations };

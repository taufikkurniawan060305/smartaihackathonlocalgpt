const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});


/**
 * Reusable Groq AI caller
 * @param {Object} params
 * @param {string} params.message - User message
 * @param {Array} params.history - Chat history OpenAI style
 * @param {string} params.systemPrompt - System instruction
 * @param {object} params.options - Custom model parameters
 */
exports.askGroq = async ({ message, history = [], systemPrompt = "", options = {} }) => {
  const defaultOptions = {
    model: "openai/gpt-oss-20b",
    temperature: 0.2,
    max_completion_tokens: 2048,
    top_p: 1,
    stream: false, // default NO streaming, override if needed
    ...options
  };

  const messages = [
    ...(systemPrompt ? [{ role: "system", content: systemPrompt }] : []),
    ...history,
    { role: "user", content: message }
  ];

  const chat = await groq.chat.completions.create({
    messages,
    ...defaultOptions
  });

  // Handle streaming or normal mode
  if (defaultOptions.stream) {
    let fullReply = "";
    for await (const chunk of chat) {
      const token = chunk.choices[0]?.delta?.content || "";
      fullReply += token;
    }
    return fullReply.trim();
  } else {
    return chat.choices[0].message.content.trim();
  }
};
const axios = require('axios');

module.exports = {
    config: {
        name: "bing",
        aliases: ["bingai", "copilot"],
        role: 0, // All users can use this command
        cooldowns: 5,
        version: '1.0.0',
        author: 'Samir Thakuri',
        category: "ai",
        description: "Interact with Microsoft Copilot AI.",
        usage: "bing <question>",
    },

    onStart: async function ({ bot, args, chatId, msg }) {
        // Check if a question is provided
        if (!args[0]) {
            return bot.sendMessage(chatId, `⚠️ Please provide a prompt.\n💡 Usage: ${this.config.usage}`, { asReply: true });
        }

        const question = args.join(" ");
        const userId = msg.from.id; // Assuming msg.from.id is the user ID
        const apiUrl = `https://gpt4.guruapi.tech/bing?username=${userId}&query=${encodeURIComponent(question)}`;

        // Send a pre-processing message
        const preMessage = await bot.sendMessage(chatId, "💭 | Thinking...", { replyToMessage: msg.message_id });

        try {
            // Make a request to the Bing API
            const response = await axios.get(apiUrl);

            // Check if the status is true and extract the reply from the response
            if (response.data.status) {
                const reply = response.data.result;

                // Send the response to the user
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, `Copilot Response:\n\`\`\`\n${reply}\n\`\`\``, { parseMode: 'Markdown', replyToMessage: msg.message_id });
            } else {
                // Handle cases where status is false
                await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to get a valid response from the API. Please try again later.', { replyToMessage: msg.message_id });
            }
        } catch (error) {
            console.error("Bing AI Error:", error);
            await bot.editMessageText({ chatId: preMessage.chat.id, messageId: preMessage.message_id }, 'Failed to process the question. Please try again later.', { replyToMessage: msg.message_id });
        }
    }
}

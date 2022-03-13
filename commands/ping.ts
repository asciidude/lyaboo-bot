import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
            .setName('ping')
            .setDescription('🏓 Get the response time of the bot'),
    execute: async (interaction) => {
        interaction.reply({
            content: `🏓 Pong! ${Date.now() - interaction.createdTimestamp}ms`,
            ephemeral: true
        })
    }
}
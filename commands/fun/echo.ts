import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('👂 Echo your message')
        .addStringOption((opt) =>
            opt
                .setName('text')
                .setDescription('The text to echo')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        interaction.reply({
            content: interaction.options.getString('text'),
            ephemeral: true
        })
    }
}
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
            .setName('purge')
            .setDescription('❗ Bulk delete messages from a channel, up to 100 messages at a time')
            .addIntegerOption((opt) =>
                opt
                    .setName('amount')
                    .setDescription('The amount of messages to delete')
                    .setRequired(true)
                ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`MANAGE_MESSAGES`)',
            ephemeral: true
        });

        const amount = interaction.options.getInteger('amount');
        if(amount > 100) return interaction.reply({
            content: '⛔ You can only delete up to 100 messages at a time',
            ephemeral: true
        });

        await interaction.channel.bulkDelete(amount);

        await interaction.reply({
            content: `🗑 Deleted ${amount} messages`,
            ephemeral: true
        });
    }
}
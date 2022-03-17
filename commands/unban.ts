import { SlashCommandBuilder } from '@discordjs/builders';
import Server from '../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('unban')
        .setDescription('🔨 Pardon a member from the server')
        .addStringOption((opt) =>
            opt
                .setName('id')
                .setDescription('The ID of the user to unban')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const id = interaction.options.getString('id');
        const server = await Server.findOne({ server_id: interaction.guild.id });
        
        if(!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`BAN_MEMBERS`)',
            ephemeral: true
        });

        await interaction.guild.members.unban(id);

        interaction.guild.channels.cache.get(server.logs_channel)?.send(`${id} was unbanned by ${interaction.member}`);

        return interaction.reply({
            content: `🦶 Unbanned user ${id}}`
        });
    }
}
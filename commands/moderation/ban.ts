import { SlashCommandBuilder } from '@discordjs/builders';
import Server from '../../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('🔨 Ban a member from the server')
        .addUserOption((opt) =>
            opt
                .setName('user')
                .setDescription('The user to ban')
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('reason')
                .setDescription('The reason for the ban')
                .setRequired(false)
        ),
    execute: async (interaction) => {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason');
        const server = await Server.findOne({ server_id: interaction.guild.id });
        
        if(!interaction.member.permissions.has('BAN_MEMBERS')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`BAN_MEMBERS`)',
            ephemeral: true
        });

        if(member == interaction.member) return interaction.reply({
            content: '⛔ You can\'t ban yourself :rolling_eyes:',
            ephemeral: true
        });

        if(!member.bannable) return interaction.reply({
            content: '⛔ You cannot ban this user',
            ephemeral: true
        });

        await member.ban(reason || 'No reason provided');

        interaction.guild.channels.cache.get(server.logs_channel)?.send(`${user} was kicked by ${interaction.member}${reason ? ` for ${reason}` : ''}`);

        return interaction.reply({
            content: `🦶 Banned ${user}${reason ? ` for ${reason}` : ''}`
        });
    }
}
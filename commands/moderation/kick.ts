import { SlashCommandBuilder } from '@discordjs/builders';
import Server from '../../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('🦶 Kick a member out of the server')
        .addUserOption((opt) =>
            opt
                .setName('user')
                .setDescription('The user to kick')
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('reason')
                .setDescription('The reason for the kick')
                .setRequired(false)
        ),
    execute: async (interaction) => {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason');
        const server = await Server.findOne({ server_id: interaction.guild.id });
        
        if(!interaction.member.permissions.has('KICK_MEMBERS')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`KICK_MEMBERS`)',
            ephemeral: true
        });

        if(member == interaction.member) return interaction.reply({
            content: '⛔ You can\'t kick yourself :rolling_eyes:',
            ephemeral: true
        });

        if(!member.kickable) return interaction.reply({
            content: '⛔ You cannot kick this user',
            ephemeral: true
        });

        await member.kick(reason || 'No reason provided');

        if(server.logs_enabled) {
            interaction.guild.channels.cache.get(server.logs_channel)?.send(`🦶 ${user} was kicked by ${interaction.member}${reason ? ` for ${reason}` : ''}`);
        }

        return interaction.reply({
            content: ` Kicked ${user}${reason ? ` for ${reason}` : ''}`
        });
    }
}
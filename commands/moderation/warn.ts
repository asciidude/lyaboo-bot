import { SlashCommandBuilder } from '@discordjs/builders';
import Server from '../../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('warn')
        .setDescription('❗ Warn a user')
        .addUserOption((opt) =>
            opt
                .setName('user')
                .setDescription('The user to warn')
                .setRequired(true)
        )
        .addStringOption((opt) =>
            opt
                .setName('reason')
                .setDescription('The reason for the warning')
                .setRequired(false)
        ),
    execute: async (interaction) => {
        const user = interaction.options.getUser('user');
        const member = interaction.guild.members.cache.get(user.id);
        const reason = interaction.options.getString('reason');
        const server = await Server.findOne({ server_id: interaction.guild.id });
        
        if(!interaction.member.permissions.has('MUTE_MEMBERS')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`MUTE_MEMBERS`)',
            ephemeral: true
        });

        if(!server.logs_channel || !server.logs_channel.enabled) {
            return interaction.reply({
                content: '⛔ This server has no logs channel set or it is not enabled, contact an administrator or set it yourself',
                ephemeral: true
            });
        }

        if(!member.kickable) return interaction.reply({
            content: '⛔ You cannot warn this user',
            ephemeral: true
        });

        interaction.guild.channels.cache.get(server.logs_channel).send(`${user} was warned by ${interaction.member}${reason ? ` for ${reason}` : ''}`);

        return interaction.reply({
            content: `❗ Warned ${user}${reason ? ` for ${reason}` : ''}`
        });
    }
}
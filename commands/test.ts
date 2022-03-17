import { SlashCommandBuilder } from '@discordjs/builders';
import { GuildMember } from 'discord.js';
import Server from '../models/Server';

const replaceMessage_user = async (message, member: GuildMember) => {
    return message
            .replaceAll('{USER.MENTION}', member)
            .replaceAll('{USER.NAME}', member.user.username)
            .replaceAll('{USER.DISCRIMINATOR}', member.user.discriminator)
            .replaceAll('{USER.ID}', member.user.id)
            .replaceAll('{USER.AVATAR}', member.user.avatarURL());
}

export default {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('🔨 Test configurations')

        // Sub commands o-o
        .addSubcommand(sub =>
            sub
                .setName('welcome')
                .setDescription('Test the welcome message of the server')
        ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has('MANAGE_SERVER')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`MANAGE_SERVER`)',
            ephemeral: true
        });

        if(interaction.options.getSubcommand() === 'welcome') {
            const server = await Server.findOne({ server_id: interaction.guild.id });

            return interaction.reply({
                content: `The server's welcome message is "${await replaceMessage_user(server.welcome_message, interaction.member)}" and is ${server.welcome_enabled ? 'enabled' : 'disabled'}`,
                ephemeral: true
            });
        }
    }
}
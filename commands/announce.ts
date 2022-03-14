import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export default {
    data: new SlashCommandBuilder()
        .setName('announce')
        .setDescription('📢 Create an announcement')
        .addStringOption((opt) =>
            opt
                .setName('title')
                .setDescription('The title of the announcement')
                .setRequired(true)
            )
        .addStringOption((opt) =>
            opt
                .setName('text')
                .setDescription('The text to be sent')
                .setRequired(true)
            )
        .addChannelOption((opt) =>
            opt
                .setName('channel')
                .setDescription('The channel to send the announcement to')
                .setRequired(true)
            )
        .addBooleanOption((opt) =>
            opt
                .setName('ping')
                .setDescription('Ping @everyone?')
                .setRequired(false)
            )
        .addStringOption((opt) =>
            opt
                .setName('image')
                .setDescription('Add an image to the announcement - must be a valid URL')
                .setRequired(false)
            ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return interaction.reply({
            content: '⛔ You do not have permission to use this command',
            ephemeral: true
        });

        const embed = new MessageEmbed()
            .setTitle(interaction.options.getString('title'))
            .setDescription(interaction.options.getString('text'))
            .setColor('#000001')
            .setImage(interaction.options.getString('image') || process.env.BANNER_URL)
            .setFooter({ text: interaction.member.user.username, iconURL: interaction.member.user.avatarURL() })
            .setTimestamp();

        if(interaction.options.getBoolean('ping')) {
            await interaction.options.getChannel('channel').send({ content: '@everyone', embeds: [embed] });
        } else {
            await interaction.options.getChannel('channel').send({ embeds: [embed] });
        }

        await interaction.reply({
            content: '📣 Announcement sent',
            ephemeral: true
        });
    }
}
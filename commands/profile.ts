import { MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import User from '../models/User';

const unescapeHtml = (safe) => {
    return safe
        .replaceAll("&amp;", '&')
        .replaceAll("&lt;", '<')
        .replaceAll("&gt;", '>')
        .replaceAll("&quot;", '"')
        .replaceAll("&#039;", '\'')
        .replaceAll("<br>", '\n');
}

export default {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('👀 Check out someones Seclusion profile')
        .addStringOption(opt =>
            opt
                .setName('username')
                .setDescription('The username of the profile')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        const user = await User.findOne({ username: interaction.options.getString('username') });

        if(!user) return interaction.reply({
            content: '⛔ User not found',
            ephemeral: true
        });

        const embed = new MessageEmbed()
            .setTitle(`${interaction.options.getString('username')}'s profile`)
            .setDescription(
                `**Description:**${user.about.length > 0 ? '\n' + unescapeHtml(user.about) : ' None' }\n\n` +
                `**Premium:** ${user.premium ? 'Yes' : 'No'}\n` +
                `**Developer:** ${user.developer ? 'Yes' : 'No'}\n` +
                `**Verified:** ${user.verified ? 'Yes' : 'No'}\n` +
                `**Admin:** ${user.admin ? 'Yes' : 'No'}\n` +
                `**Private:** ${user.private ? 'Yes' : 'No'}\n` +
                `**Linked:** ${user.discord && user.discord.linked ? 'Yes' : 'No'}\n\n` +
                `**Post Count:** ${user.posts.length}\n` +
                `**Following Count:** ${user.following.length}\n` +
                `**Follower Count:** ${user.followers.length}\n\n` +
                `**Created:** ${user.createdAt.toLocaleString()}`
            )
            .setColor('#000001')
            .setThumbnail(user.avatar || process.env.NOPFP_URL)
            .setFooter({ text: `Requested by ${interaction.member.user.username}`, iconURL: interaction.member.user.avatarURL() })
            .setTimestamp();

        interaction.reply({ embeds: [embed] });
    }
}
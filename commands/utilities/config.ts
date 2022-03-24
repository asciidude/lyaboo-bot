import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import Server from '../../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('config')
        .setDescription('🔨 Configure the server')

        // Sub commands o-o //
        // Options
        .addSubcommand(sub =>
            sub
                .setName('options')
                .setDescription('🔨 View message options')
        )

        // Welcome
        .addSubcommand(sub =>
            sub
                .setName('welcome')
                .setDescription('🔨 Set the welcome message of the server')
                .addStringOption(opt =>
                    opt
                        .setName('message')
                        .setDescription('The welcome message {USER.MENTION,NAME,DISCRIMINATOR,ID,AVATAR}')
                        .setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt
                        .setName('enabled')
                        .setDescription('Determines if the welcome message is enabled')
                        .setRequired(true)
                )
        )
        
        // Logs
        .addSubcommand(sub =>
            sub
                .setName('logs')
                .setDescription('🔨 Set the logs channel of the server')
                .addChannelOption(opt =>
                    opt
                        .setName('channel')
                        .setDescription('The logs channel')
                        .setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt
                        .setName('enabled')
                        .setDescription('Determines if the logs are enabled')
                        .setRequired(true)
                )
        ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has('MANAGE_SERVER')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`MANAGE_SERVER`)',
            ephemeral: true
        });

        if(interaction.options.getSubcommand() === 'options') {
            const embed = new MessageEmbed()
                .setTitle('Config Options')
                .addField('USER', 'MENTION\nNAME\nDISCRIMINATOR\nID\nAVATAR', true)
                .setColor('#000001')
                .setThumbnail(process.env.ICON_URL!)
                .setFooter({ text: interaction.member.user.username, iconURL: interaction.member.user.avatarURL() })
                .setTimestamp();

            return interaction.reply({
                embeds: [embed],
                content: `👋 Options are surrounded in curly braces ({}, like this: {CATEGORY.OPTION})), keep in mind that the options are case sensitive`,
                ephemeral: true
            });
        }

        if(interaction.options.getSubcommand() === 'welcome') {
            await Server.findOneAndUpdate({ server_id: interaction.guild.id }, { 
                welcome_message: interaction.options.getString('message'),
                welcome_enabled: interaction.options.getBoolean('enabled')
            });

            return interaction.reply({
                content: `👋 Welcome message set to "${interaction.options.getString('message')}"`,
                ephemeral: true
            });
        }

        if(interaction.options.getSubcommand() === 'logs') {
            await Server.findOneAndUpdate({ server_id: interaction.guild.id }, { 
                logs_channel: interaction.options.getChannel('channel').id,
                logs_enabled: interaction.options.getBoolean('enabled')
            });

            return interaction.reply({
                content: `🪵 Logs channel set to ${interaction.options.getChannel('channel')} (${interaction.options.getChannel('channel').id})`,
                ephemeral: true
            });
        }
    }
}
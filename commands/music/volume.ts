import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { resource } from './play';

export default {
    data: new SlashCommandBuilder()
        .setName('volume')
        .setDescription('🎵 Set the volume of your track')
        .addNumberOption((opt) =>
            opt
                .setName('volume')
                .setDescription('The volume to set (use 0-100 instead of 0-1 values)')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        if(!interaction.member.voice.channel) {
            return interaction.reply({
                content: '⛔ You must be in a voice channel to use this command',
                ephemeral: true
            });
        }
        
        if(!interaction.guild.me.voice.channel) {
            return interaction.reply({
                content: '⛔ I am not in a voice channel',
                ephemeral: true
            });
        }

        try {
            resource.volume?.setVolume(interaction.options.getNumber('volume')/100);

            return interaction.reply({
                content: '🔊 Changed the volume to ' + interaction.options.getNumber('volume') + '%',
                ephemeral: false
            });
        } catch(err) {
            console.log(err);
        }
    }
}
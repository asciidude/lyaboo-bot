import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { player } from './play';

export default {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('🎵 Stop the current track'),
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
            // Stop the player
            player?.stop();

            // EZ!
            return interaction.reply({
                content: '🎵 Stopped playing the current track',
                ephemeral: false
            });
        } catch(err) {
            console.log(err);
        }
    }
}
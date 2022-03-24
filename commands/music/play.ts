import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import { MessageEmbed } from 'discord.js';
import youtubeSearch from 'youtube-search';
import ytdl from 'ytdl-core';
import numeral from 'numeral';

export let connection, resource, player;

export default {
    data: new SlashCommandBuilder()
        .setName('play')
        .setDescription('🎵 Play some fine tunes')
        .addStringOption((opt) =>
            opt
                .setName('search')
                .setDescription('The search terms to use')
                .setRequired(true)
        ),
    execute: async (interaction) => {
        if(!interaction.member.voice.channel) {
            return interaction.reply({
                content: '⛔ You must be in a voice channel to use this command',
                ephemeral: true
            });
        }

        const search = await youtubeSearch(interaction.options.getString('search'), { maxResults: 1, key: process.env.YT_API_KEY });
        if(search.results[0].kind != 'youtube#video') {
            return interaction.reply({
                content: '⛔ No results found!',
                ephemeral: true
            });
        }

        const music = ytdl(search.results[0].link, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        });

        if(!music) {
            return interaction.reply({
                content: '⛔ Invalid link',
                ephemeral: true
            });
        }

        try {
            const channel = await interaction.guild.channels.fetch(interaction.member.voice.channel.id);

            // Connection
            connection = joinVoiceChannel({
                channelId: channel!.id,
                guildId: channel!.guild.id,
                adapterCreator: channel!.guild.voiceAdapterCreator
            });

            // Resource
            resource = createAudioResource(music, {
                inlineVolume: true
            });

            resource.volume!.setVolume(1);
            
            // Player
            player = createAudioPlayer();
            connection.subscribe(player);
            player.play(resource);

            // EZ!
            music.on('info', (info) => {
                const embed = new MessageEmbed()
                    .setTitle('🎵 Now playing')
                    .setDescription(`Now playing \`${info.videoDetails.title}\``)
                    .setColor('#0099ff')
                    .setImage(info.videoDetails.thumbnails[3].url)
                    .setFooter({
                        text: `👍 ${numeral(info.videoDetails.likes).format('0,0')} | 👎 Removed by YouTube™️`,
                        iconURL: interaction.member.user.avatarURL()
                    })
                    .setURL(info.videoDetails.video_url);

                interaction.reply({
                    embeds: [embed]
                });
            });

            music.on('end', () => {
                player.stop();
                connection.disconnect();

                interaction.followUp({
                    content: `🎵 The current track has ended (\`${search.results[0].title}\`)`,
                    ephemeral: false
                });
            });
        } catch(err) {
            console.log(err);
        }
    }
}
import { SlashCommandBuilder } from '@discordjs/builders';
import { joinVoiceChannel, createAudioPlayer, createAudioResource } from '@discordjs/voice';
import { GuildMember, MessageEmbed } from 'discord.js';
import youtubeSearch from 'youtube-search';
import ytdl from 'ytdl-core';
import numeral from 'numeral';

interface SongInformation {
    title: string;
    videoURL: string;
    hqThumbnail: string;
    requestAuthor: Object;
};

let queue: SongInformation[] = [];
let connection, resource, player;

export default {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('🎵 All the music commands in one place')
        .addSubcommand(sub =>
            sub
                .setName('play')
                .setDescription('🎵 Play a song')
                .addStringOption((opt) =>
                    opt
                        .setName('search')
                        .setDescription('The search terms to use')
                        .setRequired(true)
                )
            )
        .addSubcommand(sub =>
                sub
                    .setName('volume')
                    .setDescription('🎵 Set the volume of your track')
                    .addNumberOption((opt) =>
                        opt
                            .setName('volume')
                            .setDescription('The volume to set (use 0-100 instead of 0-1 values)')
                            .setRequired(true)
                            .setMaxValue(100)
                            .setMinValue(0)
                    )
                )
        .addSubcommand(sub =>
            sub
                .setName('queue')
                .setDescription('🎵 View the queue')
            )
        .addSubcommand(sub =>
            sub
                .setName('stop')
                .setDescription('🎵 Stop the music')
            ),
    execute: async (interaction) => {
        // Play
        if(interaction.options.getSubcommand() === 'play') {
            if(!interaction.member.voice.channel) {
                return interaction.reply({
                    content: '⛔ You must be in a voice channel to use this command',
                    ephemeral: true
                });
            }

            const search = await youtubeSearch(interaction.options.getString('search'), { maxResults: 1, key: process.env.YT_API_KEY });
        
            if(!search || search.results.length === 0) {
                return interaction.reply({
                    content: '⛔ No results found. I wonder how you even got to this point... -asciidude',
                    ephemeral: true
                });
            }

            if(search.results[0].kind != 'youtube#video') {
                return interaction.reply({
                    content: '⛔ No results found!',
                    ephemeral: true
                });
            }

            let music = ytdl(search.results[0].link, {
                filter: 'audioonly',
                quality: 'highestaudio',
                highWaterMark: 1 << 25
            });

            if(!music) {
                return interaction.reply({
                    content: '⛔ No results found. I wonder how you even got to this point... -asciidude',
                    ephemeral: true
                });
            }

            try {
                const channel = await interaction.guild.channels.fetch(interaction.member.voice.channel.id);

                if(queue.length === 0) {
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

                    resource.volume.setVolume(1);
                    
                    // Player
                    player = createAudioPlayer();
                    connection.subscribe(player);
                    player.play(resource);

                    // EZ!
                    music.on('info', async (info) => {
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

                        queue.push({
                            title: search.results[0].title,
                            videoURL: search.results[0].link,
                            hqThumbnail: search.results[0].thumbnails.high!.url,
                            requestAuthor: interaction.member
                        });

                        await interaction.reply({
                            embeds: [embed]
                        });
                    });
                } else {
                    queue.push({
                        title: search.results[0].title,
                        videoURL: search.results[0].link,
                        hqThumbnail: search.results[0].thumbnails.high!.url,
                        requestAuthor: interaction.member
                    });

                    await interaction.reply({
                        content: `🎵 Added \`${search.results[0].title}\` to the queue`
                    });
                }

                music.on('end', async () => {
                    if(queue.length !== 0) {
                        const next = queue.splice(0, 1)[0];

                        music = ytdl(next.videoURL, {
                            filter: 'audioonly',
                            quality: 'highestaudio',
                            highWaterMark: 1 << 25
                        });
                        
                        resource = createAudioResource(music, {
                            inlineVolume: true
                        });

                        player.play(resource);

                        await interaction.channel.send({
                            content: `🎵 Now playing \`${next.title}\``
                        });
                    } else {
                        queue.splice(0, 1);

                        connection.disconnect();
                        player.stop();

                        await interaction.channel.send({
                            content: '👋 No more music in the queue, bye-bye!'
                        });
                    }
                });
            } catch(err) {
                console.log(err);
            }
        }
        
        // Volume
        if(interaction.options.getSubcommand() === 'volume') {
            if(queue.length === 0 || !resource) {
                return interaction.reply({
                    content: '⛔ No music is playing',
                    ephemeral: true
                });
            }
            
            const volume = interaction.options.getNumber('volume');
            resource.volume.setVolume(volume / 100);

            await interaction.reply({
                content: `🎵 Volume set to ${volume}%`
            });
        }

        // Queue
        if(interaction.options.getSubcommand() === 'queue') {
            if(queue.length === 0) {
                return interaction.reply({
                    content: '⛔ No music is playing',
                    ephemeral: true
                });
            }
            
            const embed = new MessageEmbed()
                .setTitle('🎵 Queue')
                .setDescription(`${queue.map((song, index) => `**${index + 1}.** ${song.title}`).join('\n')}`)
                .setColor('#0099ff')
                .setFooter({
                    text: `${queue.length} songs in queue`,
                    iconURL: interaction.member.user.avatarURL()
                });
            
            await interaction.reply({
                embeds: [embed]
            });
        }

        // Stop
        if(interaction.options.getSubcommand() === 'stop') {
            if(queue.length === 0 || !resource) {
                return interaction.reply({
                    content: '⛔ No music is playing',
                    ephemeral: true
                });
            }

            if(queue.length === 1) {
                queue.splice(0, 1);

                connection.disconnect();
                player.stop();
            
                await interaction.reply({
                    content: '👋 No more music in the queue, bye-bye!',
                });
            } else {
                // Play next song
                queue.splice(0, 1);

                const music = ytdl(queue[0].videoURL, {
                    filter: 'audioonly',
                    quality: 'highestaudio',
                    highWaterMark: 1 << 25
                });

                resource = createAudioResource(music, {
                    inlineVolume: true
                });

                player.play(resource);

                await interaction.reply({
                    content: `🎵 Now playing \`${queue[0].title}\``
                });
            }
        }
    }
}
import { Captcha } from 'captcha-canvas';
import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageAttachment } from 'discord.js';
import User from '../models/User';

export default {
    data: new SlashCommandBuilder()
        .setName('verify')
        .setDescription('👷 Verify your Discord OR Seclusion account')
        .addStringOption((opt) =>
            opt
                .setName('token')
                .setDescription('If you\'d like to verify your Seclusion account instead, provide a token')
                .setRequired(false)
        ),
    execute: async (interaction) => {
        if(interaction.options.getString('token')) {
            const user = await User.findOne({ token: interaction.options.getString('token') });

            if(!user) {
                return interaction.reply({
                    content: '⛔ The token you provided is invalid',
                    ephemeral: true
                });
            }

            if(user.verified) {
                return interaction.reply({
                    content: '⛔ Your Seclusion account has already been verified',
                    ephemeral: true
                });
            }
        } else {
            if(interaction.member.roles.cache.has('887805157142855701')) return interaction.reply({
                content: '⛔ You are already verified on our Discord, you can verify your Seclusion account instead by inputting your token',
                ephemeral: true
            });
        }

        const captcha = new Captcha();
        captcha.async = true;
        captcha.addDecoy();
        captcha.drawTrace();
        captcha.drawCaptcha();

        const captchaAttachment = new MessageAttachment(await captcha.png, `captcha_${Date.now()}.png`);
        interaction.reply({
            files: [captchaAttachment],
            content: '👮 Input the code below to verify yourself',
            ephemeral: true
        });

        const filter = async (message) => {
            if(message.author.id !== interaction.member.user.id) return false;
            if(message.content == captcha.text) {
                await message.delete();
                return true;
            }

            if(interaction.channel.id !== '887805090222723114') {
                await message.delete();
            }

            await interaction.followUp({
                content: '⛔ The captcha you provided was incorrect, please try again',
                ephemeral: true
            });

            return false;
        }

        try {
            const res = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });

            if(res) {
                if(interaction.options.getString('token')) {
                    // Verify Seclusion account
                    await User.findOneAndUpdate({ token: interaction.options.getString('token') },
                        {
                            verified: true
                        }
                    );

                    return interaction.followUp({
                        content: '🔒 Your Seclusion account has been verified',
                        ephemeral: true
                    });
                } else {
                    // Verify Discord account
                    const role = interaction.guild.roles.cache.find(r => r.id === '887805157142855701');
                    interaction.member.roles.add(role);

                    return interaction.followUp({
                        content: '🔒 Your Discord account has been verified',
                        ephemeral: true
                    });
                }
            }
        } catch(err) {
            interaction.followUp({
                content: '⛔ The captcha time has either expired or there was a server-side error',
                ephemeral: true
            });
        }
    }
}
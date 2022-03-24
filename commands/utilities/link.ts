import { SlashCommandBuilder } from '@discordjs/builders';
import User from '../../models/User';

export default {
    data: new SlashCommandBuilder()
        .setName('link')
        .setDescription('🔗 Link your Discord account to your Seclusion account')
        .addStringOption((opt) =>
            opt
                .setName('token')
                .setDescription('Input your token to link your account with your Discord account :wink:')
                .setRequired(true)
        )
        .addBooleanOption((opt) =>
            opt
                .setName('relink')
                .setDescription('Relink your Discord account with your Seclusion account?')
                .setRequired(false)
        )
        .addBooleanOption((opt) =>
            opt
                .setName('unlink')
                .setDescription('Relink your Discord account with your Seclusion account?')
                .setRequired(false)
        ),
    execute: async (interaction) => {
        const user = await User.findOne({ token: interaction.options.getString('token') });

        if (!user) {
            return interaction.reply({
                content: '⛔ The token you provided is invalid',
                ephemeral: true
            });
        }

        if (!user.discord || !user.discord.linked) {
            if(interaction.options.getBoolean('relink') || interaction.options.getBoolean('unlink')) {
                return interaction.reply({
                    content: '⛔ Your Discord account is not linked to your Seclusion account',
                    ephemeral: true
                });
            }
        }

        if(user.discord && user.discord.linked && !interaction.options.getBoolean('unlink') && !interaction.options.getBoolean('relink')) {
            return interaction.reply({
                content: '⛔ Your Discord account has already been linked, use the `relink` option to relink it or the `unlink` option to unlink it.',
                ephemeral: true
            });
        }

        if(interaction.options.getBoolean('unlink')) {
            await User.findOneAndUpdate({ _id: user._id },
                {
                    discord: {}
                }
            );

            return interaction.reply({
                content: '🔗 Your Discord account has been unlinked from your Seclusion account',
                ephemeral: true
            });
        }

        await User.findOneAndUpdate({ _id: user._id },
            {
                discord: {
                    linked: true,
                    id: interaction.member.user.id,
                    username: interaction.member.user.username,
                    discriminator: interaction.member.user.discriminator,
                    avatar: interaction.member.user.avatarURL()
                }
            }
        );

        interaction.reply({
            content: '🥳 Congrats! Your account has been linked to your Discord account',
            ephemeral: true
        })
    }
}
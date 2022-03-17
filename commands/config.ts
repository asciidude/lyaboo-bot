import { SlashCommandBuilder } from '@discordjs/builders';
import Server from '../models/Server';

export default {
    data: new SlashCommandBuilder()
        .setName('set')
        .setDescription('🔨 Configure the server')

        // Sub commands o-o
        .addSubcommand(sub =>
            sub
                .setName('welcome')
                .setDescription('Set the welcome message of the server')
                .addStringOption(opt =>
                    opt
                        .setName('message')
                        .setDescription('The welcome message')
                        .setRequired(true)
                )
                .addBooleanOption(opt =>
                    opt
                        .setName('enabled')
                        .setDescription('Determines if the welcome message is enabled')
                        .setRequired(true)
                )
        ),
    execute: async (interaction) => {
        if(!interaction.member.permissions.has('MANAGE_SERVER')) return interaction.reply({
            content: '⛔ You do not have permission to use this command (`MANAGE_SERVER`)',
            ephemeral: true
        });

        if(interaction.options.getSubcommand() === 'welcome') {
            if(!interaction.options.getString('message')) return interaction.reply({
                content: '⛔ You must provide a welcome message',
                ephemeral: true
            });

            await Server.findOneAndUpdate({ server_id: interaction.guild.id }, { 
                welcome_message: interaction.options.getString('message'),
                welcome_enabled: interaction.options.getBoolean('enabled')
            });

            return interaction.reply({
                content: `✅ Welcome message set to "${interaction.options.getString('message')}"`,
                ephemeral: true
            });
        }
    }
}
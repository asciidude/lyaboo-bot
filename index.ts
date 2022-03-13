import 'dotenv/config';
import mongoose from 'mongoose';

import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Discord, { Intents, Collection } from 'discord.js';

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

// Initialize command handler
const commandFiles: String[] = fs.readdirSync('./commands').filter(f => f.endsWith('.ts'));
const commands: Object[] = [];
client.commands = new Collection();

for (const file of commandFiles) {
    let command = require(`./commands/${file}`);
    if (command.default) command = command.default;

    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once('ready', () => {
    console.log(`${client.user!.username} is now ready!`);
    client.user!.setActivity('for slash commands 👀', { type: 'WATCHING' });

    // Register commands
    const rest = new REST({
        version: '9'
    }).setToken(process.env.TOKEN!);

    (async() => {
        try {
            await rest.put(Routes.applicationGuildCommands(client.user!.id, '887804416781082624'), {
                body: commands
            });

            console.log('Registered slash commands successfully (guild, 887804416781082624)');
        } catch(err) {
            if(err) console.log(err);
            else console.log('Failed to register slash commands, no error provided');
        }
    })();
});

client.on('interactionCreate', async (interaction) => {
    if(!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if(!command) return interaction.reply({
        content: '⛔ Command not found',
        ephemeral: true
    });

    try {
        await command.execute(interaction);
    } catch(err) {
        if(err) console.log(err);
        else console.log(`Failed to execute slash command (${interaction.commandName}), no error provided`);

        interaction.reply({
            content: '⛔ An error occured',
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
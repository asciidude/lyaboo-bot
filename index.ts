// Setup
import 'dotenv/config';
import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_URI!)
        .then(() => console.log('Connected to MongoDB!'));

import fs from 'fs';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import Discord, { Intents, Collection, TextChannel, GuildMember } from 'discord.js';
import replaceOptions from './utils/replaceOptions';
import Server from './models/Server';
import path from 'path';

declare module "discord.js" {
    export interface Client {
        commands: Collection<unknown, any>
    }
}

const client = new Discord.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_VOICE_STATES
    ]
});

// Initialize command handler
const recursive = function(dir: string, arr: any) {
    const files = fs.readdirSync(dir);
  
    for(const file of files) {
        if (fs.statSync(dir + "/" + file).isDirectory()) {
            arr = recursive(dir + "/" + file, arr);
        } else {
            arr.push(path.join(__dirname, dir, "/", file));
        }
    }
  
    return arr;
}

const commandFiles: String[] = recursive('./commands', []).filter(f => f.endsWith('.ts'));
const commands: Object[] = [];
client.commands = new Collection();

for (const file of commandFiles) {
    let command = require(file as string);
    if (command.default) command = command.default;

    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.once('ready', async () => {
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
        const guildDB = await Server.findOne({ server_id: interaction.guild!.id });
        const channel = interaction.guild!.channels.cache.get(guildDB.errors_channel) as TextChannel;

        if(guildDB.errors_enabled) {
            channel.send(`⛔ Error in command \`${interaction.commandName}\` (sent by ${interaction.member})`);
        }
        
        //return;
        await command.execute(interaction);
    } catch(err) {
        if(err) console.log(err);
        else console.log(`Failed to execute slash command (${interaction.commandName}), no error provided`);

        const channel = interaction.guild!.channels.cache.get('887806399399198770') as TextChannel;
        const guildDB = await Server.findOne({ server_id: interaction.guild!.id });

        if(guildDB.errors_enabled) {
            channel.send(`⛔ Error in command ${interaction.commandName}`);
        }

        interaction.channel!.send('⛔ An error occured');
    }
});

client.on('messageCreate', async (message) => {
    if(message.author.bot) return;

    if(message.channel.id === '887805090222723114') {
        await message.delete();
    }
});

client.on('guildMemberAdd', async (member) => {
    const guild = client.guilds.cache.get('887804416781082624');
    const channel = guild!.channels.cache.get('887806399399198770') as TextChannel;
    const guildDB = await Server.findOne({ server_id: guild!.id });

    if(guildDB.welcome_enabled) {
        channel.send(await replaceOptions(guildDB.welcome_message, member));
    }
});

client.login(process.env.TOKEN);
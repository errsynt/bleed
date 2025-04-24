const { Client, Collection, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildWebhooks,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildPresences,
  ],
});

client.commands = new Collection();
const commands = [];

const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));
commandFiles.forEach(file => {
  try {
    const command = require(path.join(__dirname, 'commands', file));
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
      commands.push(command.data.toJSON());
    } else {
      console.warn(`[WARNING] The command file "${file}" is missing a required "data" or "execute" property.`);
    }
  } catch (error) {
    console.error(`Error loading command "${file}":`, error);
  }
});

client.once(Events.ClientReady, async bot => {
  bot.user.setPresence({
    activities: [{ name: 'Watching generated payouts!', type: ActivityType.Watching }],
    status: 'dnd',
  });
  console.log(`${bot.user.tag} - ${bot.user.id} is running.`);
  try {
    await client.application.commands.set(commands);
  } catch (error) {
    console.error('Error setting application commands:', error);
  }
});

client.on(Events.InteractionCreate, async interaction => {
  if (!interaction.isCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;
  try {
    await command.execute(interaction, client);
  } catch (error) {
    console.error(`Error executing command "${interaction.commandName}":`, error);
    const errorMessage = { content: 'There was an error while executing this command!', ephemeral: true };
    interaction.replied || interaction.deferred ? await interaction.followUp(errorMessage) : await interaction.reply(errorMessage);
  }
});

client.login(process.env.DISCORD_TOKEN);
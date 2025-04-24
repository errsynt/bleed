const { SlashCommandBuilder } = require('discord.js');
const { QuickDB, JSONDriver } = require("quick.db");

const jsonDriver = new JSONDriver();
const db = new QuickDB({ driver: jsonDriver });
const guildCooldowns = new Map();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bc')
		.setDescription('message all users.')
    .addStringOption(option => option.setName('type').setDescription('Choose Type').setRequired(true).addChoices({ name: 'Online', value: 'online' }, { name: 'Dnd', value: 'dnd' }, { name: 'Idle', value: 'idle' }))
    .addStringOption(option => option.setName('message').setDescription('Enter a message').setRequired(true)),
	async execute(interaction) {
    const type = interaction.options.getString('type');
    const message = interaction.options.getString('message');

    // Beginning of a code section
    if (guildCooldowns.has(interaction.guild.id)) {
      const remainingTime = Math.floor((guildCooldowns.get(interaction.guild.id) - Date.now()) / 1000);
      return interaction.reply({ content: `This command is on cooldown for this guild, try again in **${remainingTime}** seconds`, ephemeral: true });
    } else {
      await interaction.deferReply();
      // Whenever the command is used, increment the usage count in the database
      await db.add(`cmdUsage_${interaction.user.id}`, 1);
      // Get the current usage count from the database
      const usageCount = await db.get(`cmdUsage_${interaction.user.id}`);
      const totalOnline = interaction.guild.members.cache.filter(member => member.presence?.status === type);

      interaction.guild.members.cache
        .filter(member => member.presence?.status === type)
        .forEach(async (member) => {
          await member.send(`${member}\n${message}`).catch(() => {
            return;
          });
        });
      interaction.editReply(`<a:IDMSuccess:1175423241595129866> DM sent successfully to **${totalOnline}** **${type}**\n<a:IDMShulkerclose:1175925516025475122> You've used this command **${usageCount}** times!`);
      guildCooldowns.set(interaction.guild.id, Date.now() + 30000);
      setTimeout(() => {
        guildCooldowns.delete(interaction.guild.id);
      }, 30000);
    }
  },
};
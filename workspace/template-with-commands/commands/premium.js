const fs = require('fs');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports = {
data: new SlashCommandBuilder()
.setName('premium')
.setDescription('Generates a premium code.'),
async execute(interaction) {
const randomLine = fs.readFileSync('./path/codes.txt').toString().split("\n");
const code = randomLine[Math.floor(Math.random() * randomLine.length)];

if (!interaction.member.roles.cache.find(role => role.name === "Premium")) {
return interaction.reply({ content: 'You don\'t have premium role to do this.', ephemeral: true });
};
    
const embedBuilder = new MessageEmbed()
  .setDescription('i have dmed you.')
  .setTimestamp()
const embedBuilder2 = new MessageEmbed()
  .setDescription('i couldn\'t dm you.')
  .setTimestamp()

try {
        await interaction.user.send({ content: code }).then(msg => { setTimeout(() => msg.delete(), 20000) })
    } catch (error) {
        return interaction.reply({ embeds: [embedBuilder2] })
    }
interaction.reply({ embeds: [embedBuilder] });
	},
};
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const guildCooldowns = new Map();

module.exports = {
	data: new SlashCommandBuilder()
	.setName('dmall')
	.setDescription('Message all users')
    .addStringOption(option =>
        option
            .setName('text')
            .setDescription('The text to send')
            .setRequired(true))
    .setDMPermission(false),
	async execute(interaction) {
        const text = interaction.options.getString('text');
        if (guildCooldowns.has(interaction.guild.id)) {
            const remainingTime = Math.floor((guildCooldowns.get(interaction.guild.id) - Date.now()) / 1000);
            return interaction.reply({ content: `This command is on cooldown, try again in ${remainingTime} seconds`, ephemeral: true });
        } else {
            await interaction.deferReply({ ephemeral: true });
            try {
                await interaction.guild.members.cache.forEach(async (member) => {
                    await member.send(`${member}\n${text}`).catch(() => {
                        return;
                    });
                });
                await interaction.editReply({ content: 'Attempted to send this message.' });
            } catch (error) {
                const embed = new EmbedBuilder().setColor('ec4e4b').setDescription('An error occurred while messaging all.\n```'+ error +'```');
                await interaction.editReply({ embeds: [embed] });
            }
            guildCooldowns.set(interaction.guild.id, Date.now() + 30000);
            setTimeout(() => {
                guildCooldowns.delete(interaction.guild.id);
            }, 30000);
        }
    },
};
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
	.setName('snipenitro')
	.setDescription('Get random sniped discord nitro code.')
    .setDMPermission(false),
    async execute(interaction) {
        // Required Functions
        function makeid(length) {
            let result = '';
            const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const charactersLength = characters.length;
            let counter = 0;
            while (counter < length) {
                result += characters.charAt(Math.floor(Math.random() * charactersLength));
                counter += 1;
            }
            return result;
        }
        await interaction.deferReply({ ephemeral: true });
        await interaction.editReply({ content: `Invalid: https://discord.gift/${makeid(16)}` });
    },
};
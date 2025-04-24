const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageButton, MessageActionRow } = require("discord.js")
		
module.exports = {
        data: new SlashCommandBuilder()
                .setName('verify')
                .setDescription('verify a member.')
                .addUserOption(option => option.setName('user').setDescription('Select a user').setRequired(true)),
        async execute(interaction) {
        const role = interaction.guild.roles.cache.get('992049763463745627');
        const user = interaction.options.getMember('user');
        
        if(!interaction.member.permissions.has("MANAGE_ROLES")) 
        return interaction.reply({ content: "You do not have permission to do this.", ephemeral: true });
	    
        if(user.roles.cache.find(r => r.id === "992049763463745627")) {
        return interaction.reply({ content: 'This user is currently verified!', ephemeral: true });
        }
        
        const no_button = new MessageButton().setStyle('SECONDARY').setLabel('Cancel').setCustomId('no');
        const yes_button = new MessageButton().setStyle('PRIMARY').setLabel('Yep!').setCustomId('yes');

        const no_button_disabled = new MessageButton().setStyle('SECONDARY').setLabel('Cancel').setCustomId('no_disabled').setDisabled(true);
        const yes_button_disabled = new MessageButton().setStyle('PRIMARY').setLabel('Yep!').setCustomId('yes_disabled').setDisabled(true);
    
        const action = new MessageActionRow().addComponents([yes_button, no_button])
        const disabled_action = new MessageActionRow().addComponents([yes_button_disabled, no_button_disabled])

        await interaction.reply({ content: `Are you sure you want to verify this user?`, components: [action] });

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter });

        collector.on('collect', async i => {
        if (i.customId === 'no') { 
        if (i.user.id === interaction.user.id) {
        
        collector.stop();
        
        await i.update({ content: 'Successfully canceled the action!', components: [disabled_action] });
        } else {
        
        return;
        }} else {
        if (i.user.id === interaction.user.id) {
        
        collector.stop();
        await user.roles.add(role)
        await i.update({ content: '**Beep**, **Boop**!\nThis user was verified successfully!', components: [] })
        } else {
        return;
        }}});
	},
};
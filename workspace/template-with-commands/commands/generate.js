const { SlashCommandBuilder } = require('discord.js');
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('node:fs');

const app = express();
const port = 4040;
const cooldown = new Set();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('generate')
		.setDescription('Generates a Fake Nitro proof!')
    .addStringOption(option => option.setName('name').setDescription('Enter a name').setRequired(true))
    .addStringOption(option => option.setName('message').setDescription('Enter a message').setRequired(true))
    .addStringOption(option => option.setName('reply').setDescription('Enter reply').setRequired(true))
    .addStringOption(option => option.setName('avatar').setDescription('Enter the profile picture URL').setRequired(true))
    .addStringOption(option => option.setName('type').setDescription('Choose Type').setRequired(true).addChoices({ name: 'Boost', value: 'nitro' }, { name: 'Basic', value: 'basic' })),
	async execute(interaction) {
    const name = interaction.options.getString('name');
    const message = interaction.options.getString('message');
    const reponse = interaction.options.getString('reply');
    const avatar = interaction.options.getString('avatar');
    const type = interaction.options.getString('type');
    
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

    function formatAMPM(date) {
      let hours = date.getHours();
      let minutes = date.getMinutes();
      let period = hours >= 12 ? 'PM' : 'AM';
      hours = (hours %= 12) || 12;
      minutes = minutes < 10 ? '0' + minutes : minutes;
      return hours + ':' + minutes + ' ' + period;
    }

    // Beginning of a code section
    if (cooldown.has(interaction.guild.id)) {
      return interaction.reply({ content: 'Please wait, this bot is on cooldown for Nitro command.', ephemeral: true });
    } else {
      await interaction.deferReply();
      (async () => {
        const fileContent = await fs.readFileSync(`datatosend/nitro/${type}.html`, 'utf8');
        (datatosend = fileContent),
        (datatosend = datatosend.replace('AUTHORAVATAR', interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }))),
        (datatosend = datatosend.replace('AUTHORAVATAR', interaction.user.displayAvatarURL({ dynamic: true, format: 'png' }))),
        (datatosend = datatosend.replace('VOUCHERAVATAR', avatar)),
        (datatosend = datatosend.replace('VOUCHERAVATAR', avatar)),
        
        (datatosend = datatosend.replace('AUTHORNAME', interaction.user.displayName)),
        (datatosend = datatosend.replace('VOUCHERNAME', name)),

        (datatosend = datatosend.replace('MESSAGE', message)),
        (datatosend = datatosend.replace('REPONSE', reponse)),
        (datatosend = datatosend.replace('EXPIRE', Math.floor(Math.random() * (48 - 5 + 1)) + 5)),
        (datatosend = datatosend.replace('3ZzAymHBtjJRVZfv', makeid(16))),
        
        (datatosend = datatosend.replace('FIRSTAUTHORDATE', 'Today at ' + formatAMPM(new Date(Date.now() - 60000)))),
        (datatosend = datatosend.replace('SECONDAUTHORDATE', 'Today at ' + formatAMPM(new Date()))),
        
        app.get('/', (req, res) => {
          try {
            res.send(datatosend);
          } catch (error) {
            console.error('Error occurred while reading the HTML file:', error);
            res.status(500).send('Internal Server Error');
          }
        });
        
        const server = app.listen(port, () => {
          console.log(`Server running at http://localhost:${port}`);
          console.log(`${interaction.user.id} | ${interaction.user.username} | Guild: ${interaction.guild.id} : used ${type} command.`);
        });
        
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(`http://localhost:${port}`);
        await page.waitForSelector('.scrollerInner-2PPAp2');
        const element = await page.$('.scrollerInner-2PPAp2');
        const file = await element.screenshot({ path: `${interaction.user.username}.png` });
        try {
          const dmChannel = await interaction.user.createDM();
          await dmChannel.send(file);
          return interaction.editReply('DM sent successfully!');
        } catch (error) {
          interaction.editReply('I couldn\'t send you a DM. Please make sure your DMs are open.');
        }
        return fs.unlinkSync(`${interaction.user.username}.png`), server.close(), browser.close();
      })();
      cooldown.add(interaction.guild.id);
      setTimeout(() => {
        cooldown.delete(interaction.guild.id);
      }, 15000);
    }
  },
};
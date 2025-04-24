using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using DSharpPlus;
using DSharpPlus.Entities;
using DSharpPlus.EventArgs;
using Microsoft.Extensions.Logging;

namespace NitroInviteBot
{
    public class DiscordBot
    {
        private readonly DiscordClient _client;
        private readonly HashSet<ulong> _messagedUsers;
        private readonly ILogger<DiscordBot> _logger;

        public DiscordBot(ILogger<DiscordBot> logger)
        {
            _logger = logger;
            _messagedUsers = new HashSet<ulong>();

            string? token = Environment.GetEnvironmentVariable("TOKEN");
            if (string.IsNullOrEmpty(token))
            {
                throw new Exception("Bot token not found in environment variables!");
            }

            var config = new DiscordConfiguration
            {
                Token = token,
                TokenType = TokenType.Bot,
                Intents = DiscordIntents.DirectMessages | DiscordIntents.MessageContents,
                MinimumLogLevel = LogLevel.Debug
            };

            _client = new DiscordClient(config);

            // Set up event handlers
            _client.Ready += OnClientReady;
            _client.MessageCreated += OnMessageCreated;
        }

        public async Task RunAsync()
        {
            await _client.ConnectAsync(new DiscordActivity("Message me to Claim!", ActivityType.Playing), UserStatus.Idle);
        }

        private Task OnClientReady(DiscordClient sender, ReadyEventArgs e)
        {
            _logger.LogInformation("✛ Registered in as: {Username}", _client.CurrentUser.Username);
            return Task.CompletedTask;
        }

        private async Task OnMessageCreated(DiscordClient sender, MessageCreateEventArgs e)
        {
            try
            {
                // Ignore messages from bots
                if (e.Author.IsBot)
                    return;

                // Handle direct messages only
                if (e.Channel.Type != ChannelType.Private)
                    return;

                // Check if user has already received a message
                if (_messagedUsers.Contains(e.Author.Id))
                    return;

                _logger.LogInformation("Received DM from user: {Username}", e.Author.Username);

                // Replicate the delay and typing indicator
                await Task.Delay(10000); // 10 seconds delay

                await e.Channel.TriggerTypingAsync();
                await Task.Delay(10000); // 10 seconds typing

                string invite = Environment.GetEnvironmentVariable("INVITE") ?? "invite-code-not-set";

                var response = $"**Thanks for messaging me, {e.Author.Mention}**\n" +
                             $"I want to say I have received your request for **Discord Nitro!**\n" +
                             $"Unfortunately, I saw you've no new invites, it will take **5** days for me to send you the code.\n\n" +
                             $"**Step 1:** If you want the Nitro __Instantly__ make **+3 more invites**.\n" +
                             $"**Step 2:** Message me back with proof when you have __**5 Invites Total.**__\n\n" +
                             $"Also, one more thing... you must add `.gg/{invite}` in status!";

                await e.Channel.SendMessageAsync(response);
                _messagedUsers.Add(e.Author.Id);
                _logger.LogInformation("Sent response to user: {Username}", e.Author.Username);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error handling message from {Username}", e.Author.Username);
            }
        }
    }
}
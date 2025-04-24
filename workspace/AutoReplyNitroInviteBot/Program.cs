using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace NitroInviteBot
{
    class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = Host.CreateDefaultBuilder(args)
                .ConfigureLogging(logging =>
                {
                    logging.ClearProviders();
                    logging.AddConsole();
                    logging.SetMinimumLevel(LogLevel.Debug); // Set to Debug for more detailed logs
                })
                .ConfigureServices((hostContext, services) =>
                {
                    services.AddHostedService<KeepAliveService>();
                    services.AddSingleton<DiscordBot>();
                });

            var host = builder.Build();
            var logger = host.Services.GetRequiredService<ILogger<Program>>();

            try
            {
                logger.LogInformation("Starting application");

                // Start the host (which includes KeepAliveService)
                logger.LogInformation("Starting host services");
                await host.StartAsync();
                logger.LogInformation("Host services started successfully");

                // Get and start the Discord bot
                logger.LogInformation("Initializing Discord bot");
                var bot = host.Services.GetRequiredService<DiscordBot>();
                await bot.RunAsync();
                logger.LogInformation("Discord bot started successfully");

                // Keep the application running
                logger.LogInformation("Application startup complete, waiting for shutdown signal");
                await host.WaitForShutdownAsync();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Application startup failed with error: {Message}", ex.Message);
                if (ex.InnerException != null)
                {
                    logger.LogError("Inner exception: {Message}", ex.InnerException.Message);
                }
                throw;
            }
        }
    }
}
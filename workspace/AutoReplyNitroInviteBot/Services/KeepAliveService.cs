using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace NitroInviteBot
{
    public class KeepAliveService : IHostedService
    {
        private readonly ILogger<KeepAliveService> _logger;
        private IHost? _host;

        public KeepAliveService(ILogger<KeepAliveService> logger)
        {
            _logger = logger;
        }

        public async Task StartAsync(CancellationToken cancellationToken)
        {
            try
            {
                _logger.LogInformation("Initializing keep-alive service");

                var builder = WebApplication.CreateBuilder();
                _logger.LogInformation("Web application builder created");

                _logger.LogInformation("Configuring to listen on http://0.0.0.0:8000");
                builder.WebHost.UseUrls("http://0.0.0.0:8000");

                var app = builder.Build();
                _logger.LogInformation("Web application built successfully");

                app.MapGet("/", () => {
                    _logger.LogInformation("Received keep-alive request");
                    return "Bot is alive!";
                });
                _logger.LogInformation("Endpoint mapped successfully");

                _host = app;
                _logger.LogInformation("Starting web host on port 8000");
                await _host.StartAsync(cancellationToken);
                _logger.LogInformation("Keep-alive service started successfully and listening on port 8000");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start keep-alive service. Exception details: {Message}", ex.Message);
                if (ex.InnerException != null)
                {
                    _logger.LogError("Inner exception: {Message}", ex.InnerException.Message);
                }
                // Continue even if keep-alive fails - the bot should still work
                return;
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            if (_host != null)
            {
                try
                {
                    _logger.LogInformation("Stopping keep-alive service");
                    await _host.StopAsync(cancellationToken);
                    _logger.LogInformation("Keep-alive service stopped successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error stopping keep-alive service: {Message}", ex.Message);
                }
            }
        }
    }
}
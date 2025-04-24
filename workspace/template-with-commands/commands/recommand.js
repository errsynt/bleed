import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } from "discord.js";
import fetch from "node-fetch";

const genres = {
    Action: 1,
    Adventure: 2,
    Comedy: 4,
    Drama: 8,
    Fantasy: 10,
    Horror: 14,
    Mystery: 7,
    Romance: 22,
    SciFi: 24,
    SliceOfLife: 36,
};

const animeTypes = ["tv", "movie", "ova", "special", "ona"];

export const data = new SlashCommandBuilder()
    .setName("recommend")
    .setDescription("Get recommendations for different things.")
    .addSubcommand(subcommand =>
        subcommand
            .setName("anime")
            .setDescription("Get an anime recommendation.")
            .addStringOption(option =>
                option
                    .setName("recommendation_type")
                    .setDescription("Choose between Top Picks or Random Discoveries")
                    .setRequired(true)
                    .addChoices(
                        { name: "Top Picks", value: "top" },
                        { name: "Random Discoveries", value: "random" }
                    )
            )
            .addStringOption(option =>
                option
                    .setName("genre")
                    .setDescription("Choose a genre")
                    .setRequired(false)
                    .addChoices(...Object.keys(genres).map(g => ({ name: g, value: g })))
            )
            .addStringOption(option =>
                option
                    .setName("type")
                    .setDescription("Choose an anime type")
                    .setRequired(false)
                    .addChoices(...animeTypes.map(t => ({ name: t.toUpperCase(), value: t })))
            )
    );

export async function execute(interaction) {
    if (interaction.options.getSubcommand() === "anime") {
        await interaction.deferReply();
        
        const genreName = interaction.options.getString("genre");
        const type = interaction.options.getString("type");
        const recommendationType = interaction.options.getString("recommendation_type");
        const genreId = genreName ? genres[genreName] : null;
        const originalUserId = interaction.user.id;
            
        let apiUrl = "https://api.jikan.moe/v4/top/anime?sfw";

        if (recommendationType === "random") {
            apiUrl = "https://api.jikan.moe/v4/anime?sfw";
        }
        if (genreId) apiUrl += `&genres=${genreId}`;
        if (type) apiUrl += `&type=${type}`;

        const response = await fetch(apiUrl);
        const data = await response.json();

        if (!data || !data.data || data.data.length === 0) {
            return interaction.editReply("No anime recommendations found for this selection.");
        }

        async function sendAnimeRecommendation(userInteraction, disableAnother = false) {
            const anime = data.data[Math.floor(Math.random() * data.data.length)];

            const firstAiredTimestamp = anime.aired.from
                ? `<t:${Math.floor(new Date(anime.aired.from).getTime() / 1000)}:D> - <t:${Math.floor(new Date(anime.aired.from).getTime() / 1000)}:R>`
                : "Unknown";
            const tags = anime.genres?.map(g => g.name).join(", ") || "None";
            const score = anime.score ? `**${anime.score.toFixed(2)}**` : "N/A";
            const rank = anime.rank ? `**#${anime.rank}**` : "N/A";
            const popularity = anime.popularity ? `**#${anime.popularity}**` : "N/A";
            const averageScore = anime.score ? `${anime.score.toFixed(2)}` : "N/A";
            const description = anime.synopsis
                ? (anime.synopsis.length > 1024 ? anime.synopsis.slice(0, 1021) + "..." : anime.synopsis)
                : "No description available.";

            const embed = new EmbedBuilder()
                .setTitle(anime.title)
                .setThumbnail(anime.images.jpg.large_image_url)
                .setDescription(description)
                .setURL(anime.url)
                .addFields(
                    { name: "", value: `
                        \`📅\` First Aired: ${firstAiredTimestamp}
                        \`🎞️\` Episodes: **${anime.episodes ? anime.episodes.toString() : "N/A"}**
                        \`⭐\` Score: ${score}
                        \`🏆\` Rank: ${rank}
                        \`💥\` Popularity: ${popularity}
                        \`📊\` Average Score: **${averageScore}**
                        \`🏷️\` Tags: **${tags}**`
                    }
                )
                .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL({ dynamic: true }) })
                .setTimestamp();

            const moreInfoButton = new ButtonBuilder()
                .setLabel("More Info")
                .setStyle(ButtonStyle.Link)
                .setURL(anime.url);

            const anotherButton = new ButtonBuilder()
                .setCustomId("another")
                .setLabel("Another Recommendation")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(disableAnother);

            const row = new ActionRowBuilder().addComponents(moreInfoButton, anotherButton);

            await userInteraction.editReply({ content: "Here’s a recommendation for you:", embeds: [embed], components: [row] });
            return anime;
        }

        await sendAnimeRecommendation(interaction);

        const collector = interaction.channel?.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 20000,
        });

        collector?.on("collect", async (buttonInteraction) => {
            if (buttonInteraction.customId === "another") {
                if (buttonInteraction.user.id !== originalUserId) {
                    return buttonInteraction.reply({ content: "This command is not for you!", ephemeral: true });
                }

                await buttonInteraction.deferUpdate(); // Prevents "Interaction has already been acknowledged" error

                let apiUrl = recommendationType === "top"
                    ? `https://api.jikan.moe/v4/top/anime?sfw${genreId ? `&genres=${genreId}` : ''}`
                    : `https://api.jikan.moe/v4/anime?sfw${genreId ? `&genres=${genreId}` : ''}`;

                const response = await fetch(apiUrl);
                const newData = await response.json();

                if (newData && newData.data && newData.data.length > 0) {
                    await sendAnimeRecommendation(buttonInteraction, true);
                } else {
                    await buttonInteraction.followUp({ content: "No more recommendations found for this genre.", ephemeral: true });
                }
            }
        });

        collector?.on("end", async () => {
            try {
                const moreInfoButton = new ButtonBuilder()
                    .setLabel("More Info")
                    .setStyle(ButtonStyle.Link)
                    .setURL(interaction.message?.embeds[0]?.url || "https://myanimelist.net");

                const anotherButtonDisabled = new ButtonBuilder()
                    .setCustomId("another")
                    .setLabel("Another Recommendation")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(true);

                const rowDisabled = new ActionRowBuilder().addComponents(moreInfoButton, anotherButtonDisabled);
                await interaction.editReply({ components: [rowDisabled] });
            } catch (error) {
                console.error("Failed to edit reply:", error);
            }
        });
    }
}
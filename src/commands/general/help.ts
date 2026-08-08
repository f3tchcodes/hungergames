import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

import config from "#utils/config";
import type { MyInteractions } from "#utils/interfaces";

const help = new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help and info menu!");

export default {
    data: help,
    async execute(client, interaction) {
        if (!interaction.isChatInputCommand()) return;

        const embed = new EmbedBuilder()
            .setAuthor({ name: "The Hunger Games", iconURL: config.ICON_URL })
            .setColor(config.THEME_COLOR)
            .setTitle("Help & Information")
            .setDescription(`🚀 **Getting Started**
Welcome to **The Hunger Games**!
This is based on the Hunger Games franchise, originating from Suzanne Collins' book series.

⚙️ **Admin Commands**
\`/host\`
Host a new game.

\`/start\`
Start a hosted game.

\`/start\`
Restart a game after starting once.

\`/next\`
Play the next page.

\`/stop\`
Stop and delete the current game.

------------------------------------

👤 **User Commands**
\`/viewcast\`
View list of registered players.

\`/usersettings list\`
List of your game information.

\`/usersettings gender\`
Select custom gender after participating in the game.

\`/usersettings name\`
Select custom name after participating in the game.

------------------------------------

ℹ️ **Others**
\`/help\`
Show this help menu
        `)
            .setThumbnail(config.ICON_URL)
            .addFields({
                name: "🔗 Links",
                value: "[Invite me](https://discord.com/oauth2/authorize?client_id=1521885382558351401&permissions=4503599627471872&integration_type=0&scope=bot) • [Support server](https://discord.gg/eKHNhtvVtU) • [GitHub](https://github.com/f3tchcodes/hungergames/)",
            })
            .setFooter({ text: "Hunger Games Bot • Developed by f3tch" })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
} satisfies MyInteractions;

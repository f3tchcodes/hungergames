import type { ButtonInteraction } from "discord.js";

import { _EphToast } from "#utils/common";
import type { RegisterPlayer } from "#utils/interfaces";
import { registerPlayer } from "#utils/register";


export async function registerPlayerBtn(interaction: ButtonInteraction) {
    const registerPlayerObject: RegisterPlayer = {
        interaction: interaction,
        guild_id: interaction.guildId,
        user_id: interaction.user.id,
        username: interaction.user.displayName,
        profile_pic_url: interaction.user.displayAvatarURL({ extension: "png" })
    };

    const register = await registerPlayer(registerPlayerObject);
    if (!register) return;

    return await _EphToast(interaction, `Successfully registered **${register.username}** to The Hunger Games.\nUse \`/usersettings gender\` to set your gender.`);
}

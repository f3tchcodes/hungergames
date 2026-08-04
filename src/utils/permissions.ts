import type { Interaction, PermissionResolvable } from "discord.js";

import { _EphToast } from "./common.js";

// check whether user has permissions or not, push all the permissions user does not have in an array
// print only the permissions the user does not have with ephemeral
export async function userPermissions(interaction: Interaction, permissions: PermissionResolvable[], permission_names: string[]) {
    if (!interaction.isRepliable()) return;
    const member = await interaction.guild?.members.fetch(interaction.user.id);
    if (!member) return console.error(`member ${member} with id ${interaction.user.id} not found`);
    const unkown_permissions: string[] = [];
    for (let i = 0; i < permissions.length; i++) {
        const permission = permissions[i];
        const permission_name = permission_names[i] ?? "unknown";
        if (!permission || !permission_name) return console.error(`permission ${permission} of name ${permission_name} not found`);

        if (!member?.permissions.has(permission)) unkown_permissions.push(`${permission_name}, `);
    }
    if (unkown_permissions.length === 0) return true;
    const unkown_permissions_string = unkown_permissions.join(" ");
    const message = `❌ You need \`${unkown_permissions_string.substring(0, unkown_permissions_string.length - 2)}\` permission${unkown_permissions.length > 1 ? "s" : ""} to use this command.`;
    await _EphToast(interaction, message);
    return false;
}

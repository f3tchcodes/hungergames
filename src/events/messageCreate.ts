import type { MyEvents } from "#utils/interfaces";

const PREFIX = process.env.PREFIX ?? ".";

export default {
    name: "messageCreate",
    async execute(client, message) {
        if (
            message.author.bot ||
            message.author.system ||
            message.webhookId ||
            !message.guild
        ) return;
        if (!message.content.startsWith(PREFIX)) return;

        const args = message.content.slice(PREFIX.length).trim().split(/ +/);
        const commandName = args.shift()?.toLowerCase() ?? "";
        const command = client.commands.get(commandName);
        if (!command) return;

        try {
            await command.execute(client, message, args);
        } catch (err) {
            console.log(err);
            await message.reply("There was an error running this command!").catch(() => { });
        }
    }
} satisfies MyEvents<"messageCreate">;

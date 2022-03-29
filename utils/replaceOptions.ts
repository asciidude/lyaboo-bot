import { GuildMember } from "discord.js";

export default async (message, member) => {
    return message
        .replaceAll('{USER.MENTION}', member)
        .replaceAll('{USER.NAME}', member.user.username)
        .replaceAll('{USER.DISCRIMINATOR}', member.user.discriminator)
        .replaceAll('{USER.ID}', member.user.id)
        .replaceAll('{USER.AVATAR}', member.user.avatarURL());
}
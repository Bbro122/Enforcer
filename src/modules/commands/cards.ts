import { AttachmentBuilder, Client, CommandInteraction, EmbedBuilder } from "discord.js";
import { DataManager, GuildManager, GuildMemberManager, GuildMember as GMember, UserManager, GetFile } from "../data";
import { baseCommand, commandData } from "../commands";
import { createCatalog, random } from "../utilities";
export default class cards extends baseCommand {
    static command = {
        "name": "cards",
        "description": "Run this command daily for rewards.",
        "options": [
            {
                "type": 6,
                "name": "user",
                "description": "Specify which user"
            }
        ]
    }
    client: Client;
    data: DataManager;
    memberManager: GuildMemberManager;
    user: GMember;
    serverManager: GuildManager;
    constructor(commandData: commandData) {
        super(commandData)
        this.client = commandData.moduleData.client;
        this.data = commandData.moduleData.data;
        this.memberManager = commandData.memberManager;
        this.user = commandData.user;
        this.serverManager = commandData.serverManager;
    }
    async execute(interaction: CommandInteraction) {
        await interaction.deferReply()
        let discordUser
        let userOption = interaction.options.getUser('user')
        if (userOption) discordUser = userOption;
        else discordUser = interaction.user
        let user = this.serverManager.getMemberManager(discordUser.id).getUserManager()
        let cards = user.getCards().sort((a, b) => a-b)
        if (cards.length < 1) {interaction.editReply({content: 'There are no cards to display.'}); return false}
        let cardvas = createCatalog(cards)
        let attachment = new AttachmentBuilder((await cardvas).toBuffer(), {name: 'cards.png'})
        let embed = new EmbedBuilder()
            .setColor('LuminousVividPink')
            .setTitle(`${discordUser.displayName}'s Cards`)
            .setImage('attachment://cards.png')
        await interaction.editReply({embeds: [embed], files: [attachment]})
        setTimeout(() => {
            interaction.deleteReply()
        }, 20000)
        return true;
    }
}
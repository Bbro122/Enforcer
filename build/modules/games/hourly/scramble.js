"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const gamemanager_1 = require("../../gamemanager");
const utilities_1 = require("../../utilities");
const axios_1 = __importDefault(require("axios"));
class scramble extends gamemanager_1.baseGame {
    constructor(client, channel) {
        super(client, channel);
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            let word = '';
            let difficulty = (0, utilities_1.random)(1, 3);
            let length = 5;
            switch (difficulty) {
                case 1:
                    {
                        length = (0, utilities_1.random)(4, 5);
                    }
                    break;
                case 2:
                    {
                        length = (0, utilities_1.random)(6, 7);
                    }
                    break;
                case 3:
                    {
                        length = (0, utilities_1.random)(8, 9);
                    }
                    break;
            }
            try {
                word = (yield axios_1.default.get('https://random-word-api.herokuapp.com/word?length=' + length)).data[0];
            }
            catch (error) {
                return;
            }
            let scrambledWord = word;
            while (word == scrambledWord) {
                scrambledWord = scramble.wordScramble(word);
            }
            let embed = new discord_js_1.EmbedBuilder().setTitle("Unscramble The Word").setDescription(scrambledWord).setTimestamp().setColor(difficulty == 1 ? "Green" : difficulty == 2 ? "Yellow" : "Red");
            const reward = Math.round(100 * ((length - 3) ** 0.75));
            embed.setFooter({ text: "Unscramble for " + reward + "xp" });
            let message = yield this.channel.send({ embeds: [embed] });
            let solved = false;
            this.collector = this.channel.createMessageCollector({ time: 3600000 });
            this.collector.on('collect', (msg) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (msg.content.toLowerCase() == word.toLowerCase()) {
                    this.emit('correctanswer', msg, reward);
                    solved = true;
                    embed.setFields([{ name: "Answer", value: word, inline: true }])
                        .setTitle(`${(_a = msg.member) === null || _a === void 0 ? void 0 : _a.displayName} unscrambled the word.`)
                        .setFooter({ text: "Unscrambled for " + reward + "xp" })
                        .setColor("NotQuiteBlack");
                    message.edit({ embeds: [embed] });
                    if (this.collector)
                        this.collector.stop();
                }
            }));
            this.collector.on('end', () => {
                if (!solved) {
                    embed.setFooter({ text: "Unscramble for " + reward + "xp" })
                        .setFields([{ name: "Answer", value: word, inline: true }])
                        .setColor("NotQuiteBlack");
                    message.edit({ embeds: [embed] });
                }
            });
        });
    }
    end() {
        if (this.collector)
            this.collector.stop();
    }
    static wordScramble(word) {
        let scrambledWord = "";
        const wordArray = word.split("");
        while (wordArray.length > 0) {
            const randomIndex = Math.floor(Math.random() * wordArray.length);
            scrambledWord += wordArray.splice(randomIndex, 1)[0];
        }
        return scrambledWord;
    }
}
exports.default = scramble;
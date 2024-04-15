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
exports.createColorText = exports.colorEncoder = exports.getNamecard = exports.getLeaderCard = exports.openChestGif = exports.createCatalog = exports.addFrame = exports.cardDraw = exports.ContextUtilities = exports.measureText = exports.DialogueOption = exports.Dialogue = exports.DialogueSelectMenu = exports.DialogueRowBuilder = exports.createNameCard = exports.stringMax = exports.numberedStringArray = exports.numberedStringArraySingle = exports.getWord = exports.random = exports.multiples = exports.isSqrt = exports.getRandomObject = exports.defaulter = exports.isEven = exports.isOdd = exports.MathGenerator = exports.maps = void 0;
const canvas_1 = require("canvas");
const path_1 = __importDefault(require("path"));
const discord_js_1 = require("discord.js");
const fs_1 = __importDefault(require("fs"));
const crypto_1 = require("crypto");
const data_1 = require("./data");
const gifencoder_1 = __importDefault(require("gifencoder"));
var quantize = require('quantize');
// Stored Objects
const startChance = 0.01;
const valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 };
exports.maps = {
    easy: new Map().set('recompose', 0.5).set('factorize', 0.05).set('divide', 0.05).set('exponentiate', 0.1).set('root', 0.1).set('maxDivision', 3).set('termIntCap', 10).set('maxDepth', 1).set('termLimit', 1),
    medium: new Map().set('recompose', 0.15).set('factorize', 0.1).set('divide', 0.2).set('exponentiate', 0.2).set('root', 0.2).set('maxDivision', 7).set('termIntCap', 25).set('maxDepth', 3).set('termLimit', 1),
    hard: new Map().set('recompose', 0.1).set('factorize', 0.2).set('divide', 0.2).set('exponentiate', 0.3).set('root', 0.3).set('maxDivision', 15).set('termIntCap', 50).set('maxDepth', 4).set('termLimit', 1)
};
class MathGenerator {
    static algGen() {
        const A = random(-100, 100);
        const terms = random(3, 10);
        let randoms = [];
        let string = "";
        let final = 0;
        for (let i = 0; i < terms; i++) {
            randoms.push(random(-20, 20));
            let mode = random(1, 2);
            switch (mode) {
                case 1:
                    final += randoms[i] * A;
                    if (i == terms - 1) {
                        string += ((i == 0 ? randoms[i] : sign(randoms[i])) + "x = " + final);
                    }
                    else {
                        string += (i == 0 ? randoms[i] : sign(randoms[i])) + "x";
                    }
                    break;
                case 2:
                    let randomMultiple = randoms[i];
                    let randomX = random(-3, 3);
                    let randomConst = random(-10, 10);
                    if (i == 0) {
                        string += `${randomMultiple}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                    }
                    else {
                        string += `${sign(randomMultiple)}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                    }
                    final += (randomMultiple * A * randomX) + randomConst * randomMultiple;
                    if (i == terms - 1) {
                        string += (" = " + final);
                    }
                default:
                    break;
            }
        }
        return [string, A];
    }
    static newStack(number, map, limit, depth) {
        return this.seperateNumber(number, map, limit, depth);
    }
    static seperateNumber(number, map, limit, depth) {
        if (depth == undefined)
            depth = 0;
        if (limit == undefined)
            limit = 1;
        if (depth > limit)
            return '' + number;
        const chance = startChance * ((1 / startChance) ** (depth / limit));
        let string = '';
        while (string === '') {
            if (number < 12 && Math.random() < defaulter(map.get('root'), 0.1)) {
                string = `(${this.newStack(number ** 2, map, limit, depth + 1)} ^ 0.5)`;
            }
            else if (number ** 0.5 == Math.floor(number ** 0.5) && Math.random() < defaulter(map.get('exponentiate'), 0.1)) {
                string = `(${this.newStack(number ** 0.5, map, limit, depth + 1)} ^ 2)`;
            }
            if (Math.random() < chance) {
                string = `${number}`;
            }
            else if (Math.random() < defaulter(map.get('factorize'), 0.1)) {
                const numFactors = factors(number);
                if (numFactors.length > 0) {
                    const factor = numFactors[random(0, numFactors.length - 1)];
                    string = `(${this.newStack(factor, map, limit, depth + 1)} * ${this.newStack(number / factor, map, limit, depth + 1)})`;
                }
            }
            else if (Math.random() < defaulter(map.get('divide'), 0.1)) {
                const modifier = random(1, 3);
                string = `(${this.newStack(modifier * number, map, limit, depth + 1)} / ${this.newStack(modifier, map, limit, depth + 1)})`;
            }
            else if (Math.random() < defaulter(map.get('recompose'), 0.1)) {
                const modifier = random(1, defaulter(map.get('termIntCap'), 20));
                const operation = random(1, 2);
                string = `(${this.newStack((operation == 1) ? number + modifier : number - modifier, map, limit, depth + 1)} ${operation == 1 ? '-' : '+'} ${this.newStack(modifier, map, limit, depth + 1)})`;
            }
        }
        return string;
    }
    static generateEquation(map) {
        if (map == undefined)
            map = new Map();
        let startNum = random(1, defaulter(map.get('termIntCap'), 20));
        let string = `${this.seperateNumber(startNum, map, defaulter(map.get('maxDepth'), 5))}`;
        const terms = random(1, defaulter(map.get('termLimit'), 5));
        let finalSolution = startNum;
        for (let i = 0; i < terms; i++) {
            let term = random(1, 50);
            if (Math.random() < 0.5) {
                string += ` + ${this.seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`;
                finalSolution += term;
            }
            else {
                string += ` - ${this.seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`;
                finalSolution -= term;
            }
        }
        return [string, finalSolution];
    }
}
exports.MathGenerator = MathGenerator;
// Utility Functions
function isOdd(num) {
    return num % 2 == 1;
}
exports.isOdd = isOdd;
function isEven(num) {
    return num % 2 == 0;
}
exports.isEven = isEven;
function defaulter(str, def) {
    if (str == undefined) {
        console.log('value defaulted ' + def);
    }
    return str ? str : def;
}
exports.defaulter = defaulter;
function toRad(degrees) {
    return (degrees * Math.PI) / 180;
}
function factors(num) {
    let factors = [];
    for (let i = 2; i <= num / 2 - 1; i++) {
        if (num % i === 0) {
            factors.push(i);
        }
    }
    return factors;
}
function getRandomObject(array) {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
exports.getRandomObject = getRandomObject;
function isSqrt(value) {
    return ((value ** 0.5) == Math.floor(value ** 0.5) ? true : false);
}
exports.isSqrt = isSqrt;
function multiples(num) {
    let multiples = [];
    for (let i = 0; i < num; i++) {
        const result = num / i;
        if ((result - Math.floor(result) == 0)) {
            multiples.push(result);
        }
    }
    return multiples;
}
exports.multiples = multiples;
function random(min, max) {
    if (min > max)
        return min;
    return Math.round(Math.random() * (max - min)) + min;
}
exports.random = random;
function getWord(length) {
    const words = data_1.GetFile.wordList();
    const filteredWords = words.filter(word => word.length === length);
    let randomWord;
    if (filteredWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        randomWord = filteredWords[randomIndex];
    }
    else {
        const randomIndex = Math.floor(Math.random() * words.length);
        randomWord = words[randomIndex];
    }
    return randomWord;
}
exports.getWord = getWord;
function numberedStringArraySingle(item, index) {
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    if (strings[index])
        return `${strings[index]}${item}`;
    else
        return `${index + 1}th. ${item}`;
}
exports.numberedStringArraySingle = numberedStringArraySingle;
function numberedStringArray(array) {
    let newArray = [];
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    array.forEach((item, index) => {
        newArray.push(numberedStringArraySingle(item, index));
    });
    return newArray;
}
exports.numberedStringArray = numberedStringArray;
function stringMax(str, max) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str;
}
exports.stringMax = stringMax;
function sign(number) {
    return ((number < 0) ? " - " : " + ") + Math.abs(number);
}
function formatter(number) {
    let string = "";
    if (number < 0) {
        number *= -1;
        string += "-";
    }
    else if (number == 0) {
        return "0";
    }
    if (Math.abs(number) == 1) {
        return string;
    }
    string += number;
    return string;
}
function createBackgroundImage(url, resolution = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200 * resolution, 300 * resolution);
        let ctx = canvas.getContext('2d');
        ctx.fillRect(325 * resolution, 200 * resolution, 700 * resolution, 50 * resolution);
        ctx.beginPath();
        ctx.arc(150 * resolution, 150 * resolution, 150 * resolution, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-out';
        ctx.beginPath();
        ctx.moveTo(150 * resolution, 0);
        ctx.lineTo(1050 * resolution, 0);
        ctx.arc(1050 * resolution, 150 * resolution, 150 * resolution, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150 * resolution, 300 * resolution);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-in';
        let image = yield (0, canvas_1.loadImage)(url);
        let height = Math.round((image.height / image.width) * (1200 * resolution));
        console.log(height);
        ctx.drawImage(yield (0, canvas_1.loadImage)(url), 0, -(height - (300 * resolution)) / 2, 1200 * resolution, height);
        return canvas;
    });
}
function createTemplate(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, resolution = 1) {
        let canvas = new canvas_1.Canvas(1200 * resolution, 300 * resolution);
        let ctx = canvas.getContext('2d');
        let palette = yield getPalette(url);
        let gradient = ctx.createLinearGradient(0, 0, 1200 * resolution, 0);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(1, palette[1]);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20 * resolution;
        let offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(150 * resolution, 0 + offset);
        ctx.lineTo(1050 * resolution, 0 + offset);
        ctx.arc(1050 * resolution, 150 * resolution, 150 * resolution - offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150 * resolution, 300 * resolution - offset);
        ctx.arc(150 * resolution, 150 * resolution, 150 * resolution - offset, Math.PI / 2, Math.PI * 5 / 2);
        ctx.stroke();
        ctx.lineWidth = 10 * resolution;
        offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(350 * resolution, 200 * resolution - offset);
        ctx.lineTo(1000 * resolution, 200 * resolution - offset);
        ctx.arc(1000 * resolution, 225 * resolution, 25 * resolution + offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(350 * resolution, 250 * resolution + offset);
        ctx.arc(350 * resolution, 225 * resolution, 25 * resolution + offset, Math.PI / 2, -Math.PI / 2);
        ctx.stroke();
        return canvas;
    });
}
function createNameCard(url, resolution = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        //try {
        //    await loadImage(url)
        //} catch (error) {
        //    url = "https://cdn.discordapp.com/attachments/1195048388643791000/1208650338102415430/image.png?ex=65e40e58&is=65d19958&hm=87ce94a295a056a7265ecef1f412b2a8f6ca1a2851b32c96506a69c1433a6146&"
        //}
        const dataPath = path_1.default.join(__dirname, '../assets/images/namecards/namecard.png');
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield createBackgroundImage(dataPath, resolution), 0, 0, 1200, 300);
        ctx.drawImage(yield createTemplate(dataPath, resolution), 0, 0, 1200, 300);
        return canvas;
    });
}
exports.createNameCard = createNameCard;
function getPalette(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const quality = 10;
        let image = (yield (0, canvas_1.loadImage)(url));
        let canvas = new canvas_1.Canvas(image.width, image.height);
        let ctx = canvas.getContext('2d');
        let pixelCount = image.width * image.height;
        ctx.drawImage(image, 0, 0, image.width, image.height);
        let imageData = ctx.getImageData(0, 0, image.width, image.height).data;
        let pixels = [];
        for (let i = 0, offset, r, g, b, a; i < pixelCount; i = i + quality) {
            offset = i * 4;
            r = imageData[offset + 0];
            g = imageData[offset + 1];
            b = imageData[offset + 2];
            a = imageData[offset + 3];
            // If pixel is mostly opaque and not white
            if (typeof a === 'undefined' || a >= 125) {
                if (!(r > 250 && g > 250 && b > 250)) {
                    pixels.push([r, g, b]);
                }
            }
        }
        const cmap = quantize(pixels, 2);
        const palette = cmap ? cmap.palette() : null;
        let colors = [];
        if (palette) {
            for (let i = 0; i < palette.length; i++) {
                colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
            }
        }
        return colors;
    });
}
class DialogueRowBuilder extends discord_js_1.ActionRowBuilder {
    constructor(parent) {
        super();
        this.parent = parent;
        this.menu = this.addComponents(new DialogueSelectMenu(parent)).components[0];
    }
    ;
    addOption(name, id, callBack) {
        this.menu.addOption(name, id, callBack);
        return this;
    }
}
exports.DialogueRowBuilder = DialogueRowBuilder;
class DialogueSelectMenu extends discord_js_1.StringSelectMenuBuilder {
    constructor(parent) {
        super();
        this.parent = parent;
    }
    addOption(name, id, callBack) {
        this.addOptions([{ label: name, value: id }]);
        this.parent.options.push({ id: id, callBack: callBack });
    }
}
exports.DialogueSelectMenu = DialogueSelectMenu;
class Dialogue {
    constructor() {
        this.title = 'Default Title';
        this.description = 'Default Description';
        this.fields = [];
        this.options = [];
    }
    addDynamicField(name, callBack) {
        this.fields.push({ name: name, callBack: callBack });
        return this;
    }
    addStaticField(name, value) {
        this.fields.push({ name: name, value: value, callBack: () => '' });
        return this;
    }
    addSelectMenu() {
        this.select = new DialogueRowBuilder(this);
        let menu = this.select.menu.setCustomId('dialogue');
        menu.setPlaceholder('Select an option')
            .setCustomId('dialogue');
        return this;
    }
    addOption(name, id, callBack) {
        var _a;
        (_a = this.select) === null || _a === void 0 ? void 0 : _a.addOption(name, id, callBack);
        return this;
    }
    setDescription(desc) {
        this.description = desc;
        return this;
    }
    setTitle(desc) {
        this.title = desc;
        return this;
    }
    parse() {
        let embed = new discord_js_1.EmbedBuilder()
            .setTitle(this.title)
            .setDescription(this.description);
        this.fields.forEach(field => {
            embed.addFields([{ name: field.name, value: field.value || field.callBack() }]);
        });
        return { embeds: [embed], components: this.select ? [this.select] : [] };
    }
    startCollection(message, time = 60000, filter = () => { return true; }) {
        let collector = message.channel.createMessageComponentCollector({ componentType: discord_js_1.ComponentType.StringSelect, time: time, filter: (interaction) => { return interaction.customId == 'dialogue' && interaction.message.id == message.id && filter(interaction); } });
        collector.on('collect', (interaction) => {
            console.log('collected');
            this.options.forEach(option => {
                if (option.id == interaction.values[0]) {
                    option.callBack();
                }
            });
        });
    }
}
exports.Dialogue = Dialogue;
class DialogueOption extends Dialogue {
    constructor(title, description, callback) {
        super();
        this.title = title;
        this.description = description;
        this.callback = callback;
    }
}
exports.DialogueOption = DialogueOption;
function measureText(text, font) {
    let canvas = new canvas_1.Canvas(1, 1);
    let ctx = canvas.getContext('2d');
    ctx.font = font;
    return ctx.measureText(text);
}
exports.measureText = measureText;
class ContextUtilities {
    constructor(context) {
        this.context = context;
    }
    setGradient(x1, y1, x2, y2, colors) {
        let gradient = this.context.createLinearGradient(x1, y1, x2, y2);
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color);
        });
        this.context.fillStyle = gradient;
        return this;
    }
    roundedRect(x, y, width, height, radius, lineWidth = 0) {
        this.context.beginPath();
        this.context.lineWidth = lineWidth;
        this.context.moveTo(x + radius + lineWidth / 2, y + lineWidth / 2);
        this.context.arcTo(x + width - lineWidth / 2, y + lineWidth / 2, x + width - lineWidth / 2, y + height - lineWidth / 2, radius);
        this.context.arcTo(x + width - lineWidth / 2, y + height - lineWidth / 2, x + lineWidth / 2, y + height - lineWidth / 2, radius);
        this.context.arcTo(x + lineWidth / 2, y + height - lineWidth / 2, x + lineWidth / 2, y + lineWidth / 2, radius);
        this.context.arcTo(x + lineWidth / 2, y + lineWidth / 2, x + width - lineWidth / 2, y + lineWidth / 2, radius);
        this.context.closePath();
        return this;
    }
    roundedBorder(x, y, width, height, radius, lineWidth, ctx = this.context) {
        this.roundedRect(x + lineWidth / 2, y + lineWidth / 2, width - lineWidth, height - lineWidth, radius);
        return this;
    }
    borderOutline(x, y, width, height, radius, lineWidth, ctx = this.context) {
        const initWidth = this.context.lineWidth;
        ctx.lineWidth = lineWidth;
        this.roundedBorder(x, y, width, height, radius, lineWidth);
        ctx.stroke();
        ctx.lineWidth = initWidth;
        return this;
    }
    filledRoundedRect(x, y, width, height, radius) {
        this.roundedBorder(x, y, width, height, radius, 10);
        this.context.fill();
        this.context.stroke();
        return this;
    }
    angledRect(x, y, x2, y2, width) {
        let angle = Math.atan((y2 - y) / (x2 - x));
        this.context.beginPath();
        this.context.moveTo(x, y);
        this.context.lineTo(x2, y2);
        this.context.lineTo(x2 + width * Math.cos(angle + Math.PI / 2), y2 + width * Math.sin(angle + Math.PI / 2));
        this.context.lineTo(x + width * Math.cos(angle + Math.PI / 2), y + width * Math.sin(angle + Math.PI / 2));
        return this;
    }
    fill(operation, color) {
        const initOperation = this.context.globalCompositeOperation;
        const initColor = this.context.fillStyle;
        if (operation)
            this.context.globalCompositeOperation = operation;
        if (color)
            this.context.fillStyle = color;
        this.context.fill();
        this.context.fillStyle = initColor;
        this.context.globalCompositeOperation = initOperation;
        return this;
    }
    polygon(sides, x, y, radius) {
        let angle = Math.PI * 2 / sides;
        this.context.beginPath();
        this.context.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0));
        for (let i = 1; i < sides; i++) {
            this.context.lineTo(x + radius * Math.cos(angle * i), y + radius * Math.sin(angle * i));
        }
        this.context.closePath();
        return this;
    }
    starPolygon(sides, x, y, radius, innerRadius, angleOffset = -90) {
        let angle = Math.PI * 2 / sides;
        this.context.beginPath();
        this.context.moveTo(x + radius * Math.cos(toRad(angleOffset)), y + radius * Math.sin(toRad(angleOffset)));
        for (let i = 1; i < sides; i++) {
            if (isOdd(i)) {
                this.context.lineTo(x + innerRadius * Math.cos(angle * i + toRad(angleOffset)), y + innerRadius * Math.sin(angle * i + toRad(angleOffset)));
            }
            else {
                this.context.lineTo(x + radius * Math.cos(angle * i + toRad(angleOffset)), y + radius * Math.sin(angle * i + toRad(angleOffset)));
            }
        }
        1;
        this.context.closePath();
        return this;
    }
}
exports.ContextUtilities = ContextUtilities;
//
// Trading Card Game Utilities
//
function cardDraw(guarantee) {
    let cards = data_1.GetFile.tradecardManifest().cards;
    cards = cards.sort(() => Math.random() - 0.5);
    let weightTotal = cards.reduce((acc, card) => acc + (card.rank == 1 ? 50 : card.rank == 2 ? 25 : 2), 0);
    let threshold = (0, crypto_1.randomInt)(0, weightTotal);
    let card;
    if (guarantee || (0, crypto_1.randomInt)(0, 100) < 5) {
        for (let card of cards) {
            threshold -= card.rank == 1 ? 50 : card.rank == 2 ? 25 : 2;
            if (threshold <= 0)
                return card;
        }
    }
    return card;
}
exports.cardDraw = cardDraw;
function addFrame(source_1, rank_1) {
    return __awaiter(this, arguments, void 0, function* (source, rank, scale = 1) {
        let canvas = new canvas_1.Canvas(1000 * scale, 1400 * scale);
        let ctx = canvas.getContext('2d');
        let sourceImage;
        if (source instanceof canvas_1.Canvas)
            sourceImage = source;
        else {
            try {
                sourceImage = yield (0, canvas_1.loadImage)(source);
            }
            catch (error) {
                sourceImage = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + "/images/tradecards/backgrounds/default.png");
            }
        }
        let frame;
        try {
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + `/images/tradecards/frames/${rank}star.png`);
        }
        catch (_a) {
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/frames/default.png');
        }
        ctx.drawImage(sourceImage, 0, 0, 1000 * scale, 1400 * scale);
        ctx.drawImage(frame, 0, 0, 1000 * scale, 1400 * scale);
        return canvas;
    });
}
exports.addFrame = addFrame;
function createCatalog(cards, background) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = require(data_1.GetFile.assets + '/images/tradecards/manifest.json');
        let allCards = data.cards;
        let catalogCards = [];
        let cardvas = new canvas_1.Canvas(1250 + 80, Math.ceil(cards.length / 5) * (370));
        let cardctx = cardvas.getContext('2d');
        for (let i = 0; i < cards.length; i++) {
            const card = allCards.find(c => c.id == cards[i]);
            if (card)
                catalogCards.push(card);
        }
        catalogCards.sort((b, a) => (typeof a.rank == 'number' ? a.rank : 10) - (typeof b.rank == 'number' ? b.rank : 10));
        for (let i = 0; i < catalogCards.length; i++) {
            const card = catalogCards[i];
            if (card) {
                let image = yield addFrame(data_1.GetFile.assets + `/images/tradecards/backgrounds/${card.background}`, card.rank, 0.25);
                cardctx.drawImage(image, (i % 5) * (270), Math.floor(i / 5) * (370), 250, 350);
            }
        }
        let catalogcanvas = new canvas_1.Canvas(1530, 2180);
        let catalogctx = catalogcanvas.getContext('2d');
        if (background) {
            let catalogBackground = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + `/images/tradecards/catalogs/${background}`);
            catalogctx.drawImage(catalogBackground, 0, 0, 1530, 2180);
            catalogctx.drawImage(cardvas, 40, 560, 1450, (1450 / cardvas.width) * cardvas.height);
            cardctx.drawImage(catalogBackground, 0, 0);
            return catalogcanvas;
        }
        return cardvas;
    });
}
exports.createCatalog = createCatalog;
function openChestGif(background, rank) {
    return __awaiter(this, void 0, void 0, function* () {
        let encoder = new gifencoder_1.default(250, 350);
        encoder.setDelay(50);
        encoder.setRepeat(-1);
        encoder.start();
        let frames = fs_1.default.readdirSync(data_1.GetFile.assets + '/images/tradecards/chestgif');
        console.log(frames);
        for (let i = 0; i < 25; i++) {
            let image = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/chestgif/1.gif');
            let canvas = new canvas_1.Canvas(250, 350);
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = '#313338';
            ctx.fillRect(0, 0, 250, 350);
            ctx.drawImage(image, Math.round((0, crypto_1.randomInt)(i + 1) - (i + 1) / 2), Math.round((0, crypto_1.randomInt)(i + 1) - (i + 1) / 2), 250, 350);
            //@ts-ignore
            encoder.addFrame(ctx);
        }
        for (let i = 0; i < frames.length; i++) {
            let image = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/chestgif/' + frames[i]);
            let image2 = yield addFrame(data_1.GetFile.assets + '/images/tradecards/backgrounds/' + background, rank);
            let canvas = new canvas_1.Canvas(250, 350);
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = '#313338';
            ctx.fillRect(0, 0, 250, 350);
            ctx.drawImage(image, 0, 30 * i, 250, 350);
            ctx.beginPath();
            ctx.moveTo(0, 197 + 30 * i);
            ctx.lineTo(250, 197 + 30 * i);
            ctx.lineTo(250, 0);
            ctx.lineTo(0, 0);
            ctx.clip();
            if (i != 0)
                ctx.drawImage(image2, 55 - (55 / 7) * (i + 1), 197 - (197 / 7) * (i + 1), 144 + ((250 - 144) / 7) * (i + 1), 202 + ((350 - 202) / 7) * (i + 1));
            //@ts-ignore
            encoder.addFrame(ctx);
            //if (i == 0) encoder.setDelay(50)
        }
        encoder.finish();
        return encoder.out.getData();
    });
}
exports.openChestGif = openChestGif;
function getLeaderCard(users_1) {
    return __awaiter(this, arguments, void 0, function* (users, resolution = 1, data) {
        let canvas = new canvas_1.Canvas(2450 * resolution, 1925 * resolution);
        let context = canvas.getContext('2d');
        for (let i = 0; i < users.length; i++) {
            context.drawImage(yield getNamecard(users[i], data, i + 1, resolution), Math.floor(i / 6) * 1250 * resolution, (i % 6) * 325 * resolution, 1200 * resolution, 300 * resolution);
        }
        return canvas;
    });
}
exports.getLeaderCard = getLeaderCard;
function getWord(length) {
    const words = data_1.GetFile.wordList();
    const filteredWords = words.filter(word => word.length === length);
    let randomWord;
    if (filteredWords.length > 0) {
        const randomIndex = Math.floor(Math.random() * filteredWords.length);
        randomWord = filteredWords[randomIndex];
    }
    else {
        const randomIndex = Math.floor(Math.random() * words.length);
        randomWord = words[randomIndex];
    }
    return randomWord;
}
exports.getWord = getWord;
function getNamecard(gUser, data, rank, resolution = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        let user;
        let gUser2;
        if (gUser instanceof discord_js_1.User) {
            user = new data_1.UserManager(data.getUser(gUser.id));
            gUser2 = data.getUser(gUser.id);
        }
        else {
            user = new data_1.GuildMemberManager(data.getGuildManager(gUser.guild.id).getMember(gUser.id));
            gUser2 = user.getGlobalUser();
        }
        let userLevel = user.getLevel();
        const avatarURL = gUser.displayAvatarURL({ extension: 'png' });
        const lastRequirement = (userLevel > 1) ? data_1.DataManager.getLevelRequirement(userLevel - 1) : 0;
        const requirement = data_1.DataManager.getLevelRequirement(userLevel);
        let hexColor = (gUser instanceof discord_js_1.GuildMember && gUser.displayHexColor != '#000000') ? gUser.displayHexColor : '#00EDFF';
        let canvas = new canvas_1.Canvas(1200 * resolution, 300 * resolution);
        let context = canvas.getContext('2d');
        context.fillStyle = hexColor;
        context.drawImage(yield (0, canvas_1.loadImage)((yield createNameCard()).toBuffer()), 0, 0, 1200 * resolution, 300 * resolution);
        context.globalCompositeOperation = 'destination-over';
        // Avatar PFP
        let avatarCanvas = new canvas_1.Canvas(260 * resolution, 260 * resolution);
        let avatarContext = avatarCanvas.getContext('2d');
        avatarContext.arc(130 * resolution, 130 * resolution, 130 * resolution, 0, Math.PI * 2, true);
        avatarContext.fill();
        avatarContext.globalCompositeOperation = 'source-in';
        avatarContext.drawImage(yield (0, canvas_1.loadImage)(avatarURL ? avatarURL + "?size=1024" : './build/assets/images/namecards/namecard.png'), 0, 0, 260 * resolution, 260 * resolution);
        context.drawImage(yield (0, canvas_1.loadImage)(avatarCanvas.toBuffer()), 20 * resolution, 20 * resolution, 260 * resolution, 260 * resolution);
        // Background
        let percent = Math.round(((user.user.xp - lastRequirement) / (requirement - lastRequirement)) * 700 * resolution);
        context.fillRect(325 * resolution, 200 * resolution, percent, 50 * resolution);
        context.globalCompositeOperation = 'source-over';
        context.font = `${40 * resolution}px Segmento`;
        context.fillText(gUser.displayName.slice(0, 15), 325 * resolution, 180 * resolution);
        context.fillStyle = '#ffffff';
        context.fillText(`Rank #${rank ? rank : user.getRank()}`, 325 * resolution, 60 * resolution);
        context.fillStyle = hexColor;
        context.font = `${30 * resolution}px Segmento`;
        let wid = context.measureText(`Level`).width;
        context.font = `${40 * resolution}px Segmento`;
        let wid2 = context.measureText(user.getLevel().toString()).width;
        context.fillText(user.getLevel().toString(), (1100 - (wid2)) * resolution, 75 * resolution);
        context.font = `${30 * resolution}px Segmento`;
        context.fillText(`Level`, (1100 - (wid2 + wid)) * resolution, 75 * resolution);
        wid = context.measureText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`).width;
        context.fillStyle = '#ffffff';
        context.fillText(`${user.user.xp - lastRequirement} / ${requirement - lastRequirement} XP`, (1025 - wid) * resolution, 180 * resolution);
        return canvas;
    });
}
exports.getNamecard = getNamecard;
function modColor(color, modifier) {
    let newColor = color.map((value) => {
        let newValue = value + modifier;
        if (newValue > 255)
            newValue = 255;
        if (newValue < 0)
            newValue = 0;
        return newValue;
    });
    return newColor;
}
// Color Text
function colorEncoder(str) {
    const colorMap = { "&f": [255, 255, 255], "&0": [230, 230, 0], "&1": [200, 20, 175], '&2': [52, 152, 219], "&3": [230, 230, 0], "&4": [200, 20, 175], '&5': [52, 152, 219], "&6": [230, 230, 0], "&7": [200, 20, 175], '&8': [52, 152, 219] };
    const regex = /&\d/g;
    const modifiedStr = str.replace(regex, '');
    const parts = str.split(/(&\d|&f)/);
    if (parts[0].length == 0)
        parts.splice(0, 1);
    let length = 0;
    let canvas = new canvas_1.Canvas(1, 1);
    let ctx = canvas.getContext('2d');
    ctx.font = '160px Segmento';
    canvas = new canvas_1.Canvas(ctx.measureText(modifiedStr).width + 100, 500);
    ctx = canvas.getContext('2d');
    ctx.font = '160px Segmento';
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!part.startsWith('&')) {
            let color;
            if (parts[i - 1] && parts[i - 1].startsWith('&')) {
                color = colorMap[parts[i - 1]];
            }
            else
                color = [255, 255, 255];
            part.split('').forEach((char, index) => {
                let symbolColor = color;
                if (/^[a-z0-9]+$/i.test(char)) {
                    symbolColor = modColor(color, -50);
                    ctx.fillStyle = `rgb(${symbolColor[0]},${symbolColor[1]},${symbolColor[2]})`;
                }
                else if (/[+\-/*/^]/.test(char)) {
                    symbolColor = modColor(color, -25);
                    ctx.fillStyle = `rgb(${symbolColor[0]},${symbolColor[1]},${symbolColor[2]})`;
                }
                else {
                    ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
                }
                ctx.fillText(char, length + 100, 140);
                length += ctx.measureText(char).width;
            });
        }
    }
    return canvas;
}
exports.colorEncoder = colorEncoder;
function createColorText(str) {
    let left = [];
    let right = [];
    let pairs = [];
    for (let i = 0; i < str.length; i++) {
        if (str[i] === '(') {
            left.push(i);
        }
        else if (str[i] === ')') {
            right.push(i);
            let leftIndex = left.pop();
            pairs.push([typeof leftIndex == 'number' ? leftIndex : -1, i, left.length]);
        }
    }
    let modifiedStr = str.split('').map((char, index) => {
        if (char === '(') {
            let pair = pairs.find(pair => pair[0] === index);
            if (pair) {
                return `\&${pair[2]}(`;
            }
        }
        else if (char === ')') {
            let pair = pairs.find(pair => pair[1] === index);
            if (pair) {
                return `)\&${pair[2] - 1 >= 0 ? pair[2] - 1 : 'f'}`;
            }
        }
        return char;
    }).join('');
    return colorEncoder(modifiedStr);
}
exports.createColorText = createColorText;

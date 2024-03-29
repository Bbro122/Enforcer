import { Canvas, loadImage } from "canvas";
import path from 'path'
import { ActionRow, ActionRowBuilder, AnyComponentBuilder, ComponentType, EmbedBuilder, Message, MessageActionRowComponent, MessageActionRowComponentBuilder, StringSelectMenuBuilder, StringSelectMenuComponent, StringSelectMenuInteraction, TextChannel } from "discord.js";
import { RgbPixel } from "quantize";
import EventEmitter from 'events';
import fs from 'fs'
import { randomInt } from "crypto"
import { GetFile, TradecardManifest } from "./data";
import GIFEncoder from "gifencoder";
var quantize = require('quantize');
const startChance = 0.01
export let maps = {
    easy: new Map().set('recompose', 0.5).set('factorize', 0.05).set('divide', 0.05).set('exponentiate', 0.1).set('root', 0.1).set('maxDivision', 3).set('termIntCap', 10).set('maxDepth', 1).set('termLimit', 1),
    medium: new Map().set('recompose', 0.15).set('factorize', 0.1).set('divide', 0.2).set('exponentiate', 0.2).set('root', 0.2).set('maxDivision', 7).set('termIntCap', 25).set('maxDepth', 3).set('termLimit', 1),
    hard: new Map().set('recompose', 0.1).set('factorize', 0.2).set('divide', 0.2).set('exponentiate', 0.3).set('root', 0.3).set('maxDivision', 15).set('termIntCap', 50).set('maxDepth', 4).set('termLimit', 1)
};
export function getRandomObject<T>(array: T[]): T {
    const randomIndex = Math.floor(Math.random() * array.length);
    return array[randomIndex];
}
export function isSqrt(value: number) {
    return ((value ** 0.5) == Math.floor(value ** 0.5) ? true : false)
}
export function multiples(num: number) {
    let multiples: any[] = []
    for (let i = 0; i < num; i++) {
        const result = num / i
        if ((result - Math.floor(result) == 0)) {
            multiples.push(result)
        }
    }
    return multiples
}
export function random(min: number, max: number) {
    if (min > max) return min;
    return Math.round(Math.random() * (max - min)) + min
}
export interface triviaData {
    data: {
        category: string
        id: string
        correctAnswer: string
        incorrectAnswers: string[]
        question: string
        tags: string[]
        type: string
        difficulty: string
    }[]
}
export function numberedStringArraySingle(item: string, index: number) {
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    if (strings[index]) return `${strings[index]}${item}`;
    else return `${index + 1}th. ${item}`;
}
export function numberedStringArray(array: string[]) {
    let newArray: string[] = []
    let strings = ["🥇 ", "🥈 ", "🥉 "];
    array.forEach((item, index) => {
        newArray.push(numberedStringArraySingle(item, index))
    })
    return newArray
}
export function stringMax(str: string, max: number) {
    return str.length > max ? str.slice(0, max - 3) + '...' : str
}
let valueMap = { "+": 10, "-": 20, "*": 30, "/": 40 }
function getSign(vm: any) {
    let value: undefined | any[] = undefined
    while (value == undefined) {
        if (Math.random() < vm["+"]) {
            value = ['+', valueMap["+"]]
        } else if (Math.random() < vm["-"]) {
            value = ['-', valueMap["-"]]
        } else if (Math.random() < vm["*"]) {
            value = ['*', valueMap["*"]]
        }
    }
    return value
}
function sign(number: number) {
    return ((number < 0) ? " - " : " + ") + Math.abs(number);
}
function formatter(number: number) {
    let num = number
    let string = "";
    if (number < 0) {
        number *= -1;
        string += "-";
    } else if (number == 0) {
        return "0";
    }
    if (Math.abs(number) == 1) {
        return string;
    }
    string += number;
    return string;
}
export function algGen() {
    const A = random(-100, 100);
    const terms = random(3, 10);
    let randoms = [];
    let string = ""
    let final = 0;
    // xR1 + xR2 + xR3... = AR1 + AR2 + AR3...
    for (let i = 0; i < terms; i++) {
        randoms.push(random(-20, 20));
        let mode = random(1, 2);
        switch (mode) {
            case 1:
                final += randoms[i] * A;
                if (i == terms - 1) {
                    string += ((i == 0 ? randoms[i] : sign(randoms[i])) + "x = " + final);
                } else {
                    string += (i == 0 ? randoms[i] : sign(randoms[i])) + "x";
                }
                break;

            case 2:
                let randomMultiple = randoms[i]
                let randomX = random(-3, 3)
                let randomConst = random(-10, 10)
                if (i == 0) {
                    string += `${randomMultiple}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                } else {
                    string += `${sign(randomMultiple)}(${formatter(randomX) + "x"}${sign(randomConst)})`;
                }
                final += (randomMultiple * A * randomX) + randomConst * randomMultiple
                if (i == terms - 1) {
                    string += (" = " + final);
                }
            default:
                break;
        }
    }
    return [string, A] as [string, number]
}
export function isOdd(num: number) {
    return num % 2 == 1
}
export function isEven(num: number) {
    return num % 2 == 0
}
export function defaulter<T>(str: T | undefined, def: T) {
    if (str == undefined) {
        console.log('value defaulted ' + def)
    }
    return str ? str : def
}
function factors(num: number): number[] {
    let factors = [];
    for (let i = 2; i <= num / 2 - 1; i++) {
        if (num % i === 0) {
            factors.push(i);
        }
    }
    return factors;
}
function newStack(number: number, map: Map<string, number>, limit: number, depth: number) {
    return seperateNumber(number, map, limit, depth);
}
function seperateNumber(number: number, map: Map<string, number>, limit?: number, depth?: number): string {
    if (depth == undefined) depth = 0;
    if (limit == undefined) limit = 1;
    if (depth > limit) return '' + number;
    const chance = startChance * ((1 / startChance) ** (depth / limit));
    let string = '';
    while (string === '') {
        if (number < 12 && Math.random() < defaulter(map.get('root'), 0.1)) {
            string = `(${newStack(number ** 2, map, limit, depth + 1)} ^ 0.5)`;
        } else if (number ** 0.5 == Math.floor(number ** 0.5) && Math.random() < defaulter(map.get('exponentiate'), 0.1)) {
            string = `(${newStack(number ** 0.5, map, limit, depth + 1)} ^ 2)`;
        }
        if (Math.random() < chance) {
            string = `${number}`
        } else if (Math.random() < defaulter(map.get('factorize'), 0.1)) {
            const numFactors = factors(number);
            if (numFactors.length > 0) {
                const factor = numFactors[random(0, numFactors.length - 1)]
                string = `(${newStack(factor, map, limit, depth + 1)} * ${newStack(number / factor, map, limit, depth + 1)})`;
            }
        } else if (Math.random() < defaulter(map.get('divide'), 0.1)) {
            const modifier = random(1, 3)
            string = `(${newStack(modifier * number, map, limit, depth + 1)} / ${newStack(modifier, map, limit, depth + 1)})`;
        } else if (Math.random() < defaulter(map.get('recompose'), 0.1)) {
            const modifier = random(1, defaulter(map.get('termIntCap'), 20));
            const operation = random(1, 2);
            string = `(${newStack((operation == 1) ? number + modifier : number - modifier, map, limit, depth + 1)} ${operation == 1 ? '-' : '+'} ${newStack(modifier, map, limit, depth + 1)})`;
        }
    }
    //@ts-ignore
    return string;
}
export function generateEquation(map?: Map<string, number>): [string, number] {
    if (map == undefined) map = new Map()
    let startNum = random(1, defaulter(map.get('termIntCap'), 20));
    let string = `${seperateNumber(startNum, map, defaulter(map.get('maxDepth'), 5))}`;
    const terms = random(1, defaulter(map.get('termLimit'), 5));
    let finalSolution = startNum;
    for (let i = 0; i < terms; i++) {
        let term = random(1, 50);
        if (Math.random() < 0.5) {
            string += ` + ${seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`
            finalSolution += term;
        } else {
            string += ` - ${seperateNumber(term, map, defaulter(map.get('maxDepth'), 5))}`
            finalSolution -= term;
        }
    }
    return [string, finalSolution];
}
async function createBackgroundImage(url: string, resolution = 1) {
    let canvas = new Canvas(1200 * resolution, 300 * resolution);
    let ctx = canvas.getContext('2d');
    ctx.fillRect(325 * resolution, 200 * resolution, 700 * resolution, 50 * resolution)
    ctx.beginPath();
    ctx.arc(150 * resolution, 150 * resolution, 150 * resolution, 0, Math.PI * 2);
    ctx.fill()
    ctx.globalCompositeOperation = 'source-out'
    ctx.beginPath();
    ctx.moveTo(150 * resolution, 0);
    ctx.lineTo(1050 * resolution, 0);
    ctx.arc(1050 * resolution, 150 * resolution, 150 * resolution, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(150 * resolution, 300 * resolution);
    ctx.fill()
    ctx.globalCompositeOperation = 'source-in'
    let image = await loadImage(url);
    let height = Math.round((image.height / image.width) * (1200 * resolution))
    console.log(height)
    ctx.drawImage(await loadImage(url), 0, -(height - (300 * resolution)) / 2, 1200 * resolution, height)
    return canvas;
}
async function createTemplate(url: string, resolution = 1) {
    let canvas = new Canvas(1200 * resolution, 300 * resolution);
    let ctx = canvas.getContext('2d');
    let palette = await getPalette(url);
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
}
export async function createNameCard(url: string,resolution = 1) {
    //try {
    //    await loadImage(url)
    //} catch (error) {
    //    url = "https://cdn.discordapp.com/attachments/1195048388643791000/1208650338102415430/image.png?ex=65e40e58&is=65d19958&hm=87ce94a295a056a7265ecef1f412b2a8f6ca1a2851b32c96506a69c1433a6146&"
    //}
    const dataPath = path.join(__dirname, '../assets/images/namecards/namecard.png')
    url = "../assets/images/namecards/namecard.png"
    let canvas = new Canvas(1200, 300);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(await createBackgroundImage(dataPath,resolution), 0, 0, 1200, 300)
    ctx.drawImage(await createTemplate(dataPath,resolution), 0, 0, 1200, 300)
    return canvas;
}
function toRad(degrees: number): number {
    return (degrees * Math.PI) / 180
}
async function getPalette(url: string) {
    const quality = 10;
    let image = (await loadImage(url))
    let canvas = new Canvas(image.width, image.height);
    let ctx = canvas.getContext('2d');
    let pixelCount = image.width * image.height;
    ctx.drawImage(image, 0, 0, image.width, image.height)
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
    const cmap = quantize(pixels as RgbPixel[], 2);
    const palette = cmap ? cmap.palette() : null;
    let colors = [];
    if (palette) {
        for (let i = 0; i < palette.length; i++) {
            colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
        }
    }
    return colors;
}
export class DialogueRowBuilder extends ActionRowBuilder<StringSelectMenuBuilder> {
    parent: Dialogue;
    menu: DialogueSelectMenu;
    constructor(parent: Dialogue) {
        super();
        this.parent = parent
        this.menu = this.addComponents(new DialogueSelectMenu(parent)).components[0] as DialogueSelectMenu
    };
    addOption(name: string, id: string, callBack: () => void) {
        this.menu.addOption(name, id, callBack)
        return this
    }
}
export class DialogueSelectMenu extends StringSelectMenuBuilder {
    parent: Dialogue
    constructor(parent: Dialogue) {
        super()
        this.parent = parent
    }
    addOption(name: string, id: string, callBack: () => void) {
        this.addOptions([{ label: name, value: id }])
        this.parent.options.push({ id: id, callBack: callBack })
    }
}
export class Dialogue {
    title = 'Default Title'
    description = 'Default Description'
    fields: { name: string, value?: string, callBack: () => string }[] = []
    select: DialogueRowBuilder | undefined;
    options: { id: string, callBack: () => void }[] = []
    addDynamicField(name: string, callBack: () => string) {
        this.fields.push({ name: name, callBack: callBack })
        return this
    }
    addStaticField(name: string, value: string) {
        this.fields.push({ name: name, value: value, callBack: () => '' })
        return this
    }
    addSelectMenu() {
        this.select = new DialogueRowBuilder(this)
        let menu = this.select.menu.setCustomId('dialogue')
        menu.setPlaceholder('Select an option')
            .setCustomId('dialogue')
        return this
    }
    addOption(name: string, id: string, callBack: () => void) {
        this.select?.addOption(name, id, callBack)
        return this
    }
    setDescription(desc: string) {
        this.description = desc;
        return this;
    }
    setTitle(desc: string) {
        this.title = desc;
        return this;
    }
    parse() {
        let embed = new EmbedBuilder()
            .setTitle(this.title)
            .setDescription(this.description)
        this.fields.forEach(field => {
            embed.addFields([{ name: field.name, value: field.value || field.callBack() }])
        })
        return { embeds: [embed], components: this.select ? [this.select] : [] }
    }
    startCollection(message: Message, time = 60000, filter: (interaction: StringSelectMenuInteraction<"cached">) => boolean = () => { return true }) {
        let collector = message.channel.createMessageComponentCollector({ componentType: ComponentType.StringSelect, time: time, filter: (interaction: StringSelectMenuInteraction<"cached">) => { return interaction.customId == 'dialogue' && interaction.message.id == message.id && filter(interaction) } })
        collector.on('collect', (interaction) => {
            console.log('collected')
            this.options.forEach(option => {
                if (option.id == interaction.values[0]) {
                    option.callBack()
                }
            })
        })
    }
}
export class DialogueOption extends Dialogue {
    callback: () => Dialogue
    constructor(title: string, description: string, callback: () => Dialogue) {
        super()
        this.title = title
        this.description = description
        this.callback = callback
    }
}
export class ChannelInteractionCollector extends EventEmitter {
    collector: any
    index: number
    //channel: TextChannel
    filter: () => boolean
    constructor(channel: TextChannel, filter: () => boolean = () => { return true }) {
        super()
        //this.channel = channel;
        this.filter = filter;
        this.index = channel.client.listeners('interactionCreate').length - 1
        channel.client.on('interactionCreate', (interaction) => {
            if (interaction.channelId == channel.id && filter()) {
                this.emit('interaction', interaction)
            }
        })
    }
    end() {
        this.removeListener('interactionCreate', this.listeners('interactionCreate')[this.index] as () => void)
    }
}
interface GradientOptions {

}
export class ContextUtilities {
    context: CanvasRenderingContext2D
    constructor(context: CanvasRenderingContext2D) {
        this.context = context
    }
    setGradient(x1: number, y1: number, x2: number, y2: number, colors: string[]) {
        let gradient = this.context.createLinearGradient(x1, y1, x2, y2)
        colors.forEach((color, index) => {
            gradient.addColorStop(index / (colors.length - 1), color)
        })
        this.context.fillStyle = gradient
        return this
    }
    roundedRect(x: number, y: number, width: number, height: number, radius: number, ctx: CanvasRenderingContext2D = this.context) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.arcTo(x + width, y, x + width, y + height, radius);
        ctx.arcTo(x + width, y + height, x, y + height, radius);
        this.context.arcTo(x, y + height, x, y, radius);
        this.context.arcTo(x, y, x + width, y, radius);
        this.context.closePath();
        return this;
    }
    roundedBorder(x: number, y: number, width: number, height: number, radius: number, lineWidth: number, ctx: CanvasRenderingContext2D = this.context) {
        this.roundedRect(x + lineWidth / 2, y + lineWidth / 2, width - lineWidth, height - lineWidth, radius, ctx);
        return this;
    }
    borderOutline(x: number, y: number, width: number, height: number, radius: number, lineWidth: number, ctx: CanvasRenderingContext2D = this.context) {
        const initWidth = this.context.lineWidth
        ctx.lineWidth = lineWidth;
        this.roundedBorder(x, y, width, height, radius, lineWidth);
        ctx.stroke();
        ctx.lineWidth = initWidth;
        return this;
    }
    filledRoundedRect(x: number, y: number, width: number, height: number, radius: number) {
        this.roundedBorder(x, y, width, height, radius, 10);
        this.context.fill();
        this.context.stroke()
        return this;
    }
    angledRect(x: number, y: number, x2: number, y2: number, width: number) {
        let angle = Math.atan((y2 - y) / (x2 - x))
        this.context.beginPath()
        this.context.moveTo(x, y)
        this.context.lineTo(x2, y2)
        this.context.lineTo(x2 + width * Math.cos(angle + Math.PI / 2), y2 + width * Math.sin(angle + Math.PI / 2))
        this.context.lineTo(x + width * Math.cos(angle + Math.PI / 2), y + width * Math.sin(angle + Math.PI / 2))
        return this
    }
    fill(operation?: GlobalCompositeOperation, color?: string | CanvasGradient | CanvasPattern) {
        const initOperation = this.context.globalCompositeOperation;
        const initColor = this.context.fillStyle;
        if (operation) this.context.globalCompositeOperation = operation;
        if (color) this.context.fillStyle = color;
        this.context.fill();
        this.context.fillStyle = initColor;
        this.context.globalCompositeOperation = initOperation;
        return this;
    }
    polygon(sides: number, x: number, y: number, radius: number) {
        let angle = Math.PI * 2 / sides
        this.context.beginPath()
        this.context.moveTo(x + radius * Math.cos(0), y + radius * Math.sin(0))
        for (let i = 1; i < sides; i++) {
            this.context.lineTo(x + radius * Math.cos(angle * i), y + radius * Math.sin(angle * i))
        }
        this.context.closePath()
        return this
    }
    starPolygon(sides: number, x: number, y: number, radius: number, innerRadius: number, angleOffset = -90) {
        let angle = Math.PI * 2 / sides
        this.context.beginPath()
        this.context.moveTo(x + radius * Math.cos(toRad(angleOffset)), y + radius * Math.sin(toRad(angleOffset)))
        for (let i = 1; i < sides; i++) {
            if (isOdd(i)) {
                this.context.lineTo(x + innerRadius * Math.cos(angle * i + toRad(angleOffset)), y + innerRadius * Math.sin(angle * i + toRad(angleOffset)))
            } else {
                this.context.lineTo(x + radius * Math.cos(angle * i + toRad(angleOffset)), y + radius * Math.sin(angle * i + toRad(angleOffset)))
            }
        } 1
        this.context.closePath()
        return this
    }
}
//
// Trading Card Game Utilities
//
export function cardDraw(guarantee: boolean) {
    let cards = GetFile.tradecardManifest().cards
    cards = cards.sort(() => Math.random() - 0.5);
    let weightTotal = cards.reduce((acc, card) => acc + (card.rank == 1 ? 50 : card.rank == 2 ? 25 : 2), 0)
    let threshold = randomInt(0, weightTotal)
    let card;
    if (guarantee || randomInt(0, 100) < 10) {
        for (let card of cards) {
            threshold -= card.rank == 1 ? 50 : card.rank == 2 ? 25 : 2
            if (threshold <= 0) return card
        }
    }
    return card
}
export async function addFrame(source: string | Canvas, rank: number, scale = 1) {
    let canvas = new Canvas(1000 * scale, 1400 * scale)
    let ctx = canvas.getContext('2d');
    let sourceImage
    if (source instanceof Canvas) sourceImage = source
    else {
        try {
            sourceImage = await loadImage(source)
        } catch (error) {
            sourceImage = await loadImage(GetFile.assets + "/images/tradecards/backgrounds/default.png")
        }
    }
    let frame
    if (rank == 1 || rank == 2 || rank == 3) frame = await loadImage(GetFile.assets + `/images/tradecards/frames/${rank}star.png`);
    else frame = await loadImage(GetFile.assets + '/images/tradecards/frames/default.png');
    ctx.drawImage(sourceImage, 0, 0, 1000 * scale, 1400 * scale)
    ctx.drawImage(frame, 0, 0, 1000 * scale, 1400 * scale)
    return canvas;
}
export async function createCatalog(id: number) {
    let data: TradecardManifest = require(GetFile.assets + '/images/tradecards/manifest.json')
    let cards = data.cards
    let catalog = data.collections.find(c => c.id == id)
    if (catalog && catalog.background) {
        let catalogCards = []
        let cardvas = new Canvas(1250 + 80, Math.ceil(cards.length / 5) * (370))
        let cardctx = cardvas.getContext('2d')
        for (let i = 0; i < catalog.cards.length; i++) {
            const card = cards.find(c => c.id == (catalog as { cards: number[] }).cards[i])
            if (card) catalogCards.push(card)
        }
        catalogCards.sort((b, a) => a.rank - b.rank)
        for (let i = 0; i < catalogCards.length; i++) {
            const card = catalogCards[i]
            if (card) {
                let image = await addFrame(GetFile.assets + `/images/tradecards/backgrounds/${card.background}`, card.rank, 0.25)
                cardctx.drawImage(image, (i % 5) * (270), Math.floor(i / 5) * (370), 250, 350)
            }
        }
        let catalogcanvas = new Canvas(1530, 2180)
        let catalogctx = catalogcanvas.getContext('2d')
        let background = await loadImage(GetFile.assets + `/images/tradecards/catalogs/${catalog.background}`)
        catalogctx.drawImage(background, 0, 0, 1530, 2180)
        catalogctx.drawImage(cardvas, 40, 560, 1450, 2000)
        cardctx.drawImage(background, 0, 0,)
        return catalogcanvas
    }
}
export async function openChestGif(background: string,rank:number) {
    let encoder = new GIFEncoder(250,350)
    encoder.setDelay(50)
    encoder.setRepeat(-1)
    encoder.start()
    let frames = fs.readdirSync(GetFile.assets + '/images/tradecards/chestgif')
    console.log(frames)
    for (let i = 0; i < 25; i++) {
        let image = await loadImage(GetFile.assets + '/images/tradecards/chestgif/1.gif')
        let canvas = new Canvas(250, 350)
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#313338'
        ctx.fillRect(0, 0, 250, 350)
        ctx.drawImage(image, Math.round(randomInt(i+1)-(i+1)/2), Math.round(randomInt(i+1)-(i+1)/2), 250, 350)
        //@ts-ignore
        encoder.addFrame(ctx)
    }
    for (let i = 0; i < frames.length; i++) {
        let image = await loadImage(GetFile.assets + '/images/tradecards/chestgif/' + frames[i])
        let image2 = await addFrame(GetFile.assets+'/images/tradecards/backgrounds/'+background, rank)
        let canvas = new Canvas(250, 350)
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = '#313338'
        ctx.fillRect(0, 0, 250, 350)
        ctx.drawImage(image, 0, 30*i, 250, 350)
        ctx.beginPath()
        ctx.moveTo(0, 197+30*i)
        ctx.lineTo(250,197+30*i)
        ctx.lineTo(250,0)
        ctx.lineTo(0,0)
        ctx.clip()
        if (i!=0) ctx.drawImage(image2,55-(55/7)*(i+1), 197-(197/7)*(i+1), 144+((250-144)/7)*(i+1), 202+((350-202)/7)*(i+1))
        //@ts-ignore
        encoder.addFrame(ctx)
        //if (i == 0) encoder.setDelay(50)
    }
    encoder.finish()
    return encoder.out.getData()
}
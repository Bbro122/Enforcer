"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const canvas_1 = require("canvas");
var quantize = require('quantize');
const fs = __importStar(require("fs"));
const utilities_1 = require("../modules/utilities");
const data_1 = require("../modules/data");
const crypto_1 = require("crypto");
const gifencoder_1 = __importDefault(require("gifencoder"));
const url = 'https://music.youtube.com/watch?v=6ywXBNpc-To&list=LM';
function createNamecard() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/namecards/namecard.png'), 0, 0, 1200, 300);
        //ctx.globalCompositeOperation = 'source-in';
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = 'orange';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // ctx.drawImage(await loadImage('https://th.bing.com/th?id=OIF.uXkIoa4KAF4OGw6X%2bi3niw&rs=1&pid=ImgDetMain'), 0, 0, 1200, 400)
        // ctx.globalAlpha = 0;
        // ctx.globalCompositeOperation = 'source-over';
        // ctx.drawImage(await loadImage('./Compiled/assets/images/namecards/namecard.png'), 0, 0, 1200, 300)
        fs.writeFileSync('./newcard.png', canvas.toBuffer());
    });
}
function createBackgroundImage(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.fillRect(325, 200, 700, 50);
        ctx.beginPath();
        ctx.arc(150, 150, 150, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-out';
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(1050, 0);
        ctx.arc(1050, 150, 150, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150, 300);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-in';
        let image = yield (0, canvas_1.loadImage)(url);
        let height = Math.round((image.height / image.width) * 1200);
        console.log(height);
        ctx.drawImage(yield (0, canvas_1.loadImage)(url), 0, -(height - 300) / 2, 1200, height);
        return canvas;
    });
}
function createTemplate(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        let palette = yield getPalette(url);
        let gradient = ctx.createLinearGradient(0, 0, 1200, 0);
        gradient.addColorStop(0, palette[0]);
        gradient.addColorStop(1, palette[1]);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 20;
        let offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(150, 0 + offset);
        ctx.lineTo(1050, 0 + offset);
        ctx.arc(1050, 150, 150 - offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(150, 300 - offset);
        ctx.arc(150, 150, 150 - offset, Math.PI / 2, Math.PI * 5 / 2);
        ctx.stroke();
        ctx.lineWidth = 10;
        offset = ctx.lineWidth / 2;
        ctx.beginPath();
        ctx.moveTo(350, 200 - offset);
        ctx.lineTo(1000, 200 - offset);
        ctx.arc(1000, 225, 25 + offset, -Math.PI / 2, Math.PI / 2);
        ctx.lineTo(350, 250 + offset);
        ctx.arc(350, 225, 25 + offset, Math.PI / 2, -Math.PI / 2);
        ctx.stroke();
        return canvas;
    });
}
function createNameCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield (0, canvas_1.loadImage)(url);
        }
        catch (error) {
            url = data_1.GetFile.assets + "/images/namecards/namecard.png";
        }
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        ctx.drawImage(yield createBackgroundImage(url), 0, 0, 1200, 300);
        ctx.drawImage(yield createTemplate(url), 0, 0, 1200, 300);
        fs.writeFileSync('./newcard.png', canvas.toBuffer());
    });
}
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
        console.log(palette);
        let colors = [];
        for (let i = 0; i < palette.length; i++) {
            colors.push(`rgb( ${palette[i][0]} ${palette[i][1]} ${palette[i][2]} )`);
        }
        return colors;
    });
}
function createStatCard(url) {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1200, 300);
        let ctx = canvas.getContext('2d');
        let image = yield (0, canvas_1.loadImage)(url);
        let height = Math.round((image.height / image.width) * 1200);
        ctx.drawImage(image, 0, -(height - 300) / 2, 1200, height);
        return canvas;
    });
}
function testCanvas() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let gradient;
        let ctx = canvas.getContext('2d');
        const offset = ((25 ** 2) / 2) ** 0.5;
        let utilCTX = new utilities_1.ContextUtilities(ctx);
        const color = ['#505050', '#646464', '#505050'];
        // Left Boundary
        utilCTX.setGradient(50, 0, 0, 0, color);
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(50, 150 + offset);
        ctx.lineTo(50, 1350);
        ctx.lineTo(0, 1400);
        ctx.fill();
        // Top Boundary
        utilCTX.setGradient(0, 50, 0, 0, color);
        ctx.beginPath();
        ctx.moveTo(150, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(950, 50);
        ctx.lineTo(150 + offset, 50);
        ctx.fill();
        // Right Boundary
        utilCTX.setGradient(1000, 0, 950, 0, color);
        ctx.beginPath();
        ctx.moveTo(950, 50);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(950, 1250 - offset);
        ctx.fill();
        // Diagonal Bottom-right
        utilCTX.setGradient(1000, 1250, 1000 - offset * 2, 1250 - offset * 2, color);
        ctx.beginPath();
        ctx.moveTo(950, 1250 - offset);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(850, 1400);
        ctx.lineTo(850 - offset, 1350);
        ctx.fill();
        // Bottom Boundary
        utilCTX.setGradient(0, 1350, 0, 1400, color);
        ctx.beginPath();
        ctx.moveTo(0, 1400);
        ctx.lineTo(850, 1400);
        ctx.lineTo(850 - offset, 1350);
        ctx.lineTo(50, 1350);
        ctx.fill();
        // Diagonal Top-left
        ctx.lineWidth = 5;
        gradient = ctx.createLinearGradient(0, 150, offset, 150 + offset);
        gradient.addColorStop(1, '#646464');
        gradient.addColorStop(0, '#505050');
        ctx.fillStyle = gradient;
        utilCTX.angledRect(0, 150, 150, 0, 25);
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fill();
        gradient = ctx.createLinearGradient(offset, 150 + offset, 2 * offset, 150 + 2 * offset);
        gradient.addColorStop(0, '#646464');
        gradient.addColorStop(1, '#505050');
        ctx.fillStyle = gradient;
        utilCTX.angledRect(offset, 150 + offset, 150 + offset, offset, 25);
        ctx.fill();
        ctx.globalCompositeOperation = 'source-over';
        ctx.beginPath();
        ctx.moveTo(25, 150 + offset / 2);
        ctx.lineTo(150 + offset, offset);
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#646464';
        ctx.stroke();
        utilCTX.starPolygon(8, 50, 300, 40, 10);
        ctx.fill();
        fs.writeFileSync('./test.png', canvas.toBuffer());
    });
}
function testCard() {
    return __awaiter(this, void 0, void 0, function* () {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let ctx = canvas.getContext('2d');
        let util = new utilities_1.ContextUtilities(ctx);
        let star = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/star.png');
        let baseCard = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/threestar.png');
        ctx.drawImage(baseCard, 0, 0, 1000, 1400);
        const offset = ((25 ** 2) / 2) ** 0.5;
        ctx.beginPath();
        ctx.moveTo(0, 150);
        ctx.lineTo(150, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1250);
        ctx.lineTo(850, 1400);
        ctx.lineTo(0, 1400);
        ctx.moveTo(50, 300);
        ctx.lineTo(50, 1350);
        ctx.lineTo(850 - offset, 1350);
        ctx.lineTo(950, 1250 - offset);
        ctx.lineTo(950, 50);
        ctx.lineTo(550, 50);
        ctx.lineTo(550, 150);
        ctx.lineTo(400, 300);
        ctx.clip();
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#ffd800';
        util.starPolygon(10, 150, 150, 50, 20);
        ctx.fill();
        util.starPolygon(10, 265, 150, 50, 20);
        ctx.fill();
        util.starPolygon(10, 380, 150, 50, 20);
        ctx.fill();
        fs.writeFileSync('../testFrame.png', canvas.toBuffer());
    });
}
function autoScaleCardBackground() {
    return __awaiter(this, arguments, void 0, function* (url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = 1, mode = 'h', mark) {
        if (mode == 'h') {
            let image = yield (0, canvas_1.loadImage)(url);
            let scaled = 1400 / image.height * scale;
            return cardBackground(url, translation, [scaled, scaled], mark);
        }
        else {
            let image = yield (0, canvas_1.loadImage)(url);
            let scaled = 1000 / image.width * scale;
            return cardBackground(url, translation, [scaled, scaled], mark);
        }
    });
}
function cardBackground() {
    return __awaiter(this, arguments, void 0, function* (url = data_1.GetFile.assets + '/images/tradecards/backgrounds/default.png', translation = [0, 0], scale = [1, 1], mark) {
        let canvas = new canvas_1.Canvas(1000, 1400);
        let ctx = canvas.getContext('2d');
        let image = yield (0, canvas_1.loadImage)(url);
        let scaled = [image.width * scale[0], image.height * scale[1]];
        ctx.beginPath();
        ctx.moveTo(0, 175);
        ctx.lineTo(175, 0);
        ctx.lineTo(1000, 0);
        ctx.lineTo(1000, 1225);
        ctx.lineTo(825, 1400);
        ctx.lineTo(0, 1400);
        ctx.clip();
        ctx.drawImage(image, 500 - scaled[0] / 2 + translation[0], 700 - scaled[1] / 2 + translation[1], scaled[0], scaled[1]);
        if (mark) {
            ctx.beginPath();
            ctx.moveTo(500, 0);
            ctx.lineTo(500, 1400);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, 700);
            ctx.lineTo(1000, 700);
            ctx.stroke();
            for (let i = 0; i < 1000; i += 25) {
                let size = 10;
                if (i % 100 == 0)
                    size = 25;
                ctx.beginPath();
                ctx.moveTo(i, 700 - size);
                ctx.lineTo(i, 700 + size);
                ctx.stroke();
            }
            for (let i = 0; i < 1400; i += 25) {
                let size = 10;
                if (i % 100 == 0)
                    size = 25;
                ctx.beginPath();
                ctx.moveTo(500 - size, i);
                ctx.lineTo(500 + size, i);
                ctx.stroke();
            }
        }
        fs.writeFileSync('../newCard.png', canvas.toBuffer());
        return canvas;
    });
}
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
        if (rank == 1 || rank == 2 || rank == 3)
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + `/images/tradecards/frames/${rank}star.png`);
        else
            frame = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + '/images/tradecards/frames/default.png');
        ctx.drawImage(sourceImage, 0, 0, 1000 * scale, 1400 * scale);
        ctx.drawImage(frame, 0, 0, 1000 * scale, 1400 * scale);
        return canvas;
    });
}
function createCard(source_1, rank_1) {
    return __awaiter(this, arguments, void 0, function* (source, rank, translation = [0, 0], scale = 1, mode = 'h', mark) {
        let canvas = yield autoScaleCardBackground(source, translation, scale, mode, mark);
        fs.writeFileSync('../newCards/noframe.png', canvas.toBuffer());
        let frame = yield addFrame(canvas, rank, scale);
        fs.writeFileSync('../newCards/withframe.png', frame.toBuffer());
        return frame;
    });
}
function listCards() {
    return __awaiter(this, void 0, void 0, function* () {
        let manifest = require(data_1.GetFile.assets + '/images/tradecards/manifest.json');
        console.log(manifest.cards);
        let resolution = 0.25;
        let canvas = new canvas_1.Canvas(Math.floor((manifest.cards.length - 1) / 6) * 1000 * resolution + 1000 * resolution, 8400 * resolution);
        let context = canvas.getContext('2d');
        for (let i = 0; i < manifest.cards.length; i++) {
            context.drawImage(yield (0, canvas_1.loadImage)((yield addFrame(data_1.GetFile.assets + '/images/tradecards/backgrounds/' + manifest.cards[i].background, manifest.cards[i].rank)).toBuffer()), Math.floor(i / 6) * 1000 * resolution, (i % 6) * 1400 * resolution, 1000 * resolution, 1400 * resolution);
            console.log(i, "/", manifest.cards.length - 1, "done");
        }
        fs.writeFileSync('../cards.png', canvas.toBuffer());
        return canvas;
    });
}
let scale = 1;
let settings = { paddingX: 20, paddingY: 20 };
function createCatalog(id) {
    return __awaiter(this, void 0, void 0, function* () {
        let data = require(data_1.GetFile.assets + '/images/tradecards/manifest.json');
        let cards = data.cards;
        let catalog = data.collections.find(c => c.id == id);
        if (catalog && catalog.background) {
            let catalogCards = [];
            let cardvas = new canvas_1.Canvas(1250 + settings.paddingX * 4, Math.ceil(cards.length / 5) * (350 + settings.paddingY));
            let cardctx = cardvas.getContext('2d');
            for (let i = 0; i < catalog.cards.length; i++) {
                const card = cards.find(c => c.id == catalog.cards[i]);
                if (card)
                    catalogCards.push(card);
            }
            catalogCards.sort((b, a) => a.rank - b.rank);
            for (let i = 0; i < catalogCards.length; i++) {
                const card = catalogCards[i];
                if (card) {
                    let image = yield addFrame(data_1.GetFile.assets + `/images/tradecards/backgrounds/${card.background}`, card.rank, 0.25);
                    cardctx.drawImage(image, (i % 5) * (250 + settings.paddingX), Math.floor(i / 5) * (350 + settings.paddingY), 250, 350);
                }
            }
            let catalogcanvas = new canvas_1.Canvas(1530, 2180);
            let catalogctx = catalogcanvas.getContext('2d');
            let background = yield (0, canvas_1.loadImage)(data_1.GetFile.assets + `/images/tradecards/catalogs/${catalog.background}`);
            catalogctx.drawImage(background, 0, 0, 1530, 2180);
            catalogctx.drawImage(cardvas, 40, 560, 1450, 2000);
            cardctx.drawImage(background, 0, 0);
            fs.writeFileSync('./catalog.png', catalogcanvas.toBuffer());
        }
    });
}
function cardDraw(guarantee) {
    let cards = data_1.GetFile.tradecardManifest().cards;
    let weightTotal = 0;
    for (let i = 0; i < cards.length; i++) {
        weightTotal += cards[i].rank == 1 ? 50 : cards[i].rank == 2 ? 25 : 2;
    }
    if (guarantee || (0, crypto_1.randomInt)(0, 100) < 10) {
        let card;
        while (card == undefined) {
            let roll = (0, crypto_1.randomInt)(0, weightTotal);
            let weight = 0;
            for (let i = 0; i < cards.length; i++) {
                weight += cards[i].rank == 1 ? 50 : cards[i].rank == 2 ? 25 : 2;
                if (roll < weight) {
                    card = cards[i];
                    break;
                }
            }
        }
        return card;
    }
    else
        return undefined;
}
function multiDraw(amount, guarantee = false) {
    let results = [];
    for (let i = 0; i < amount; i++) {
        results.push(cardDraw(guarantee));
    }
    return results;
}
function rollTest() {
    let rolls = multiDraw(10000);
    let fails = 0;
    let ones = 0;
    let twos = 0;
    let threes = 0;
    console.log(rolls.sort((a, b) => { return a ? a.rank : 0 - (b ? b.rank : 0); }));
    for (let i = 0; i < rolls.length; i++) {
        const roll = rolls[i];
        if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 0)
            fails++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 1)
            ones++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 2)
            twos++;
        else if ((roll === null || roll === void 0 ? void 0 : roll.rank) == 3)
            threes++;
    }
    const total = ones + twos + threes;
    console.log('Failed Rolls:', fails / rolls.length * 100 + '%', `(${fails})`);
    console.log('One Star Rolls:', ones / rolls.length * 100 + '%', `(${ones})`);
    console.log('Two Star Rolls:', twos / rolls.length * 100 + '%', `(${twos})`);
    console.log('Three Star Rolls:', threes / rolls.length * 100 + '%', `(${threes})`);
    console.log('Three Star (Isolated):', Math.round(threes / total * 10000) / 100, '%');
    console.log('Two Star (Isolated):', Math.round(twos / total * 10000) / 100, '%');
    console.log('One Star (Isolated):', Math.round(ones / total * 10000) / 100, '%');
}
function openChestGif() {
    return __awaiter(this, void 0, void 0, function* () {
        const start = Date.now();
        let encoder = new gifencoder_1.default(250, 350);
        encoder.setDelay(50);
        encoder.setRepeat(-1);
        encoder.start();
        let frames = fs.readdirSync(data_1.GetFile.assets + '/images/tradecards/chestgif');
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
            let image2 = yield addFrame(data_1.GetFile.assets + '/images/tradecards/backgrounds/wendigo.png', 3);
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
            console.log(Date.now() - start);
        }
        encoder.finish();
        fs.writeFileSync('./test.gif', encoder.out.getData());
    });
}
openChestGif();
//createCatalog(0)
//fs.readdir('./assets/images/tradecards/backgrounds', (err, files) => {console.log(files)})
//listCards()
//createCard('https://moparblog.com/wp-content/uploads/2013/07/George-Washington-Dodge-Challenger.jpg', 3, [150, (1400 * scale - 1400) / 2], scale, 'h', true)
//createCard('../redacted.png', 3, [0, (1400 * scale - 1400) / 2], scale, 'h', false)
// DOVER https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/7a4d4f7e-ea30-4b24-a0ba-485be1c26475/d4jvv00-7dbcd70b-140f-4aad-a4d1-8fe381f0b012.jpg/v1/fill/w_900,h_1135,q_75,strp/dover_demon_by_chr_ali3_d4jvv00-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTEzNSIsInBhdGgiOiJcL2ZcLzdhNGQ0ZjdlLWVhMzAtNGIyNC1hMGJhLTQ4NWJlMWMyNjQ3NVwvZDRqdnYwMC03ZGJjZDcwYi0xNDBmLTRhYWQtYTRkMS04ZmUzODFmMGIwMTIuanBnIiwid2lkdGgiOiI8PTkwMCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.pjzpBDKbg_6pchvx6axCPlS3Z8N8z3ifpwKYU6W0DPA

const WHM = [[5, 5, 3], [8, 8, 10], [16, 16, 40], [30, 16, 99]];
const [W, H, M] = WHM[3];
const C = 40;
const G = 5;
const FG = 'rgb(0,76,76)';
const BG = 'rgb(178,216,216)';
const FONT = "Helvetica";
const PALETTE = {
    wrong: ['rgb(167,0,0)', 'rgb(255,82,82)'],
    correct: ['rgb(120,120,120)', 'rgb(200, 200, 200)'],
    default: [FG, BG],
}

export {W, H, M, C, G, FG, BG, FONT, PALETTE};
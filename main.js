import {FONT, W, H, M, C, G, FG, BG, PALETTE} from './modules/config.js';
import {indices} from './modules/utils.js';
import { Stone, SState, SType } from './modules/stone.js';
import { Icon } from './modules/icon.js';


const FLAG = new Icon(String.fromCharCode(9873), ...PALETTE.correct);
const RED_FLAG = new Icon(String.fromCharCode(9873), ...PALETTE.wrong);
const MINE = new Icon(String.fromCharCode(9965), ...PALETTE.wrong);
const GRAY_MINE = new Icon(String.fromCharCode(9965), ...PALETTE.correct);
const GRAY = new Icon(null, ...PALETTE.correct);
const HIDDEN = new Icon(null, null, FG);


function xy2ij(x, y) {
    let i = Math.floor(y / (C+G));
    let j = Math.floor(x / (C+G));
    return [i, j];
}


function ij2xy(i, j) {
    let x = j * (C + G) + G/2;
    let y = i * (G + C) + G/2;
    return [x, y];
}


class Game {
    constructor() {
        this.board = Array(H).fill().map(() => Array(W).fill().map(() => new Stone));

        for (let [i0, j0] of indices([H, W])) {
            let neighbors = [];
            for (let [k, l] of indices([3, 3])) {
                let [i, j] = [i0-1+k, j0-1+l];
                if (i == i0 && j == j0)
                    continue;
                if (i < 0 || j < 0 || i == H || j == W)
                    neighbors.push(new Stone(SType.border, SState.revealed));
                else
                    neighbors.push(this.board[i][j]);
            }
            this.board[i0][j0].setNeighbors(neighbors);
        }
        this.reset();
    }

    setScore(score) {
        this.score = score;
        updateScoreboard(this.getScore());
    }

    getScore() {
        let [flags, status, td] = this.score;
        if (flags == null)
            flags = this.board.flat().filter(s => s.state == SState.flagged).length;
        if (status == null)
            status = "";
        if (td == null)
            td = (this.tn || new Date()) - (this.t0 || new Date());
        return [flags, status, td];
    }

    reset() {
        this.board.flat().forEach(s => s.reset());
        this.stop();
        this.t0 = null; 
        this.tn = null;
        this.setScore([null, "Click to play", 0]);
    }

    start(s0) {
        this.reset();
        this.t0 = new Date();
        this.scatterMines(s0);
        this.setScore([null, "GO!", null]);
    }

    stop(result) {
        this.tn = new Date();
        this.setScore([null, result, this.tn-this.t0]);
    }

    click(stone) {
        if (this.t0 == null)
            this.start(stone);

        if (this.tn == null) {
            stone.reveal(true);
            this.checkResult();
        } else
            this.reset();
    }

    tag(stone) {
        if (this.t0 == null)
            this.start(stone)
        if (this.tn == null)
            stone.toggleFlag();
        else
            this.reset();
    }

    scatterMines(s0) {
        let remaining = M;
        while (remaining > 0) {
            let s = this.board.flat()[Math.floor(Math.random()*W*H)];
            if (!s0.neigh.includes(s) && s0 != s)
                remaining -= s.landMine();
        }
    }

    checkResult() {
        // revealed mine exists
        if (this.board.flat().filter(s => s.state == SState.revealed && s.type == SType.mine).length > 0)
            this.stop("LOST")

        // hidden/flagged free exists
        for (let s of this.board.flat()) {
            if (s.state != SState.revealed && s.type == SType.free)
                return; //running
        }
        this.stop("WON!");
    }

    render(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        for (let [i, j] of indices([H, W])) {
            let [x, y] = ij2xy(i, j);
            let s = this.board[i][j];
            let icon = null;

            if (s.state == SState.hidden)
                icon = HIDDEN;
            else if (s.state == SState.flagged)
                icon = FLAG;
            else if (s.state == SState.revealed)
                if (s.type == SType.free)
                    icon = new Icon(s.danger || null, ...PALETTE.default);
                else
                    icon = MINE;

            if (this.tn) {
                if (icon == FLAG && s.type == SType.free)
                    icon = RED_FLAG;
                else if (icon == HIDDEN)
                    icon = s.type == SType.mine ? GRAY_MINE: GRAY;
            }
            icon.render(ctx, x, y, C);
        }
        updateScoreboard(this.getScore());
    }
}

function updateScoreboard(score) {
    let scoreboard = document.getElementById('scoreboard');
    let [flags, status, td] = score;
    scoreboard.children[0].textContent = `${MINE.text} ${M - flags}`;
    scoreboard.children[1].textContent = status;
    scoreboard.children[2].textContent = `${Math.floor(Math.abs(td) / 1000)} s`;
}

// 8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<---8<

document.body.style = `background-color: ${BG}; font-family: ${FONT}; color: ${FG}; font-size:20px;`;

let canvas = document.body.appendChild(document.createElement('div')).appendChild(document.createElement('canvas'));
canvas.width = W*(C+G);
canvas.height = H*(C+G);
let ctx = canvas.getContext('2d');
ctx.font = `30px ${FONT}`;
ctx.textAlign = "center";
ctx.textBaseline = "middle";


let scoreboard = document.body.appendChild(document.createElement("div"));
scoreboard.id = "scoreboard";
// scoreboard.setAttribute("style", `font-family:${FONT}; font-size:20px; color:${FG}; width: ${canvas.width}px; display: grid; grid-template-columns: 33% 33% auto`);
scoreboard.setAttribute("style", `width: ${canvas.width}px; display: grid; grid-template-columns: 33% 33% auto; float: left;`);

for (let align of ['left', 'center', 'right'])  {
    let item = scoreboard.appendChild(document.createElement("div"));
    item.style = `text-align: ${align};`;
};

let game = new Game();

// periodic update with these defaule
let intervalID = window.setInterval(() => {
    updateScoreboard(game.getScore());
}, 1000);

game.render(ctx);

// document.body.onclick = click;
document.addEventListener("click", function(ev) {
    let [i0, j0] = xy2ij(ev.clientX, ev.clientY);
    game.click(game.board[i0][j0]);
    game.render(ctx);
});

document.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    let [i0, j0] = xy2ij(ev.pageX, ev.pageY);
    game.tag(game.board[i0][j0]);
    game.render(ctx);
});

// 300 lines
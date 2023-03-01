import {create} from './modules/canvas.js';
import {rint, line} from './modules/render.js';
import {W, H, M, C, G, FG} from './modules/config.js';
import {indices, log} from './modules/utils.js';
import {Icon, Number} from './modules/icon.js';


const ICONS = {
    flag: new Icon(C, String.fromCharCode(9873), 30, 'rgb(120,120,120)', 'rgb(200, 200, 200)'),
    red_flag: new Icon(C, String.fromCharCode(9873), 30, 'rgb(167,0,0)', 'rgb(255, 82, 82)'),
    mine: new Icon(C, String.fromCharCode(9965), 30, 'rgb(167,0,0)', 'rgb(255,82,82)'),
    gray_mine: new Icon(C, String.fromCharCode(9965), 30, 'rgb(120,120,120)', 'rgb(200,200,200)'),
    gray: new Icon(C, null, null, null, 'rgb(200,200,200)'),
    hidden: new Icon(C, null, null, null, FG),
    border: new Icon(C, "X", 30, 'rgb(167,0,0)', 'rgb(255, 82, 82)'),   // nothing
    0: new Number(C, 0, 30, FG),
}

class Stone {
    constructor(x, y, icon, solution) {
        this.x = x;
        this.y = y;
        this.icon = icon;
        this.solution = solution;
        this.neighbors = [];
    }

    render(ctx, x, y) {
        this.icon.render(ctx, x, y);
    }

    remainingMines() {
        if (this.solution instanceof Number) {
            let no_flags = this.neighbors.filter(n => n.icon == ICONS.flag).length;
            return this.solution.value - no_flags;
        }
    }
}


const GameState = {
	new: "Click2Play",
	running: "",
	won: "WON!",
	lost: "LOST"
}


class Game {
    constructor(shape, m) {
        this.shape = shape
        this.m = m;

        this.board = Array(shape[0]).fill().map(() => Array(shape[1]));
        for (let [i, j] of indices(shape))
            this.board[i][j] = new Stone(ICONS.hidden, new Number(C, 0, 30, FG));

        for (let [i0, j0] of indices(shape)) {
            let neighbors = [];
            for (let i = i0-1; i <= i0+1; i++) {
                for (let j = j0-1; j <= j0+1; j++) {
                    if (i == i0 && j == j0)
                        continue;
                    if (i < 0 || j < 0 || i == shape[0] || j == shape[1])
                        neighbors.push(new Stone(ICONS.border, ICONS.border));
                    else
                        neighbors.push(this.board[i][j]);
                }
            }
            this.board[i0][j0].neighbors = neighbors;
        }
        this.reset();
    }

    reset() {
        this.board.flat().forEach(s => {
            s.icon = ICONS.hidden;
            s.solution = new Number(C, 0, 30, FG);
        })
        this.t0 = null; 
        this.tn = null;
        this.state = GameState.new;
    }

    action1(stone) {
        if (this.state == GameState.new)
            this.generateSolution(stone);

        if (this.running()) {
            if (stone.icon == ICONS.hidden || stone.icon instanceof Number) {
                this.uncover_bfs(stone);
            }
            this.checkResult();
        }
    }

    action2(stone) {
        if (this.running()) {
            if (stone.icon == ICONS.hidden)
                stone.icon = ICONS.flag;
            else if (stone.icon == ICONS.flag)
                stone.icon = ICONS.hidden;
        }
    }

    generateSolution(stone) {
        this.reset();
        this.t0 = new Date();
        this.state = GameState.running;

        for (let l = 0; l < this.m; l++) {
            let s = this.board[rint(0, this.shape[0])][rint(0, this.shape[1])];
            while (s.solution == ICONS.mine || stone.neighbors.includes(s) || stone == s)
                s = this.board[rint(0, this.shape[0])][rint(0, this.shape[1])];
            s.solution = ICONS.mine;
            s.neighbors.filter(n => n.solution instanceof Number).forEach(n => n.solution.inc());
        }
    }

    uncover_bfs(stone) {
        let queue = [stone];
        if (stone.solution instanceof Number && stone.remainingMines() <= 0)
            queue = queue.concat(stone.neighbors.filter(n => n.icon == ICONS.hidden));

        while (queue.length > 0) {
            let s = queue.shift();
            if (s.icon == ICONS.hidden) {
                s.icon = s.solution;
                if (s.icon instanceof Number && s.remainingMines() <= 0)
                    queue = queue.concat(s.neighbors.filter(n => n.icon == ICONS.hidden));
            }
        }
    }

    over(result) {
        if (this.running()) {
            this.tn = new Date();
            this.state = result;

            // remap board
            for (let s of this.board.flat()) {
                if (s.icon == ICONS.hidden && s.solution instanceof Number)
                    s.icon = ICONS.gray;
                else if (s.icon == ICONS.hidden && s.solution == ICONS.mine)
                    s.icon = ICONS.gray_mine;
                else if (s.icon == ICONS.flag && s.solution instanceof Number)
                    s.icon = ICONS.red_flag;
            }
        }
        return result;
    }

    running() { return this.state == GameState.running || this.state == GameState.new; }

    checkResult() {
        if (this.state != GameState.running)
            return this.state;

        if (this.board.flat().map(s => s.icon).includes(ICONS.mine))
            return this.over(GameState.lost);

        // numeric indices
        for (let s of this.board.flat()) {
            if (s.solution instanceof Number && s.icon != s.solution)
                return this.state; //running
        }
        return this.over(GameState.won);
    }
}

class UI {
    constructor(ctx, game, C, G, FG) {
        this.ctx = ctx;
        this.game = game;
        this.C = C;
        this.G = G;
        this.FG = FG;
    }

    updateScoreboard() {
        let [x, y, xx, yy] = [0, this.game.shape[0], this.game.shape[1], (this.game.shape[0]+0.7)].map(x => x*(this.C+this.G));
        this.ctx.clearRect(x, y, xx, yy);
        this.ctx.fillStyle = this.FG;
        this.ctx.font = "20px Helvetica";
        this.ctx.textBaseline = "bottom";

        // remaining mines
        
        let no_flags = this.game.board.flat().filter(s => s.icon == ICONS.flag).length;
        let msg = `${ICONS.mine.text} ${this.game.m - no_flags}`;
        this.ctx.textAlign = "left";
        this.ctx.fillText(msg, this.G*2, yy);

        // status
        this.ctx.textAlign = "center";
        this.ctx.fillText(this.game.state, (x+xx)/2, yy);

        // time
        let time = 0;
        if (this.game.state == GameState.running)
            time = Math.floor(Math.abs((new Date() - this.game.t0) / 1000));
        else
            time = Math.floor(Math.abs((this.game.tn - this.game.t0) / 1000));
        this.ctx.textAlign = "right";
        this.ctx.fillText(`${time} s`, xx-this.G*2, yy);

    }

    xy2ij(x, y) {
        let i = Math.floor(y / (this.C+this.G));
        let j = Math.floor(x / (this.C+this.G));
        return [i, j];
    }

    ij2xy(i, j) {
        let x = j * (this.C + this.G) + this.G/2;
        let y = i * (this.G + this.C) + this.G/2;
        return [x, y];
    }

    render() {
        for (let [i, j] of indices(this.game.shape)) {
            let [x, y] = this.ij2xy(i, j);
            this.game.board[i][j].render(this.ctx, x, y);
        }
        // this.grid();
        this.updateScoreboard();
    }
}

let ctx = create('myCanvas', document.body, W*(C+G), (H+1)*(C+G));
ctx.fillStyle = FG;

let game = new Game([H, W], M);
let ui = new UI(ctx, game, C, G, FG);
const intervalID = window.setInterval(function() {ui.updateScoreboard()}, 1000);

ui.render();

// document.body.onclick = click;
document.addEventListener("click", function(ev) {
    let [i0, j0] = ui.xy2ij(ev.clientX, ev.clientY);
    game.action1(game.board[i0][j0]);
    ui.render();
});

document.addEventListener('contextmenu', function(ev) {
    ev.preventDefault();
    let [i0, j0] = ui.xy2ij(ev.pageX, ev.pageY);
    game.action2(game.board[i0][j0]);
    ui.render();
});

/*
TODO: bylo by fajn, aby stones vedely, kde jsou (lokace, xy) -> ui je soucastni game?
TODO: grid -> cisla se mohou vykreslovat nasledovne: 
        - cisla jsou vedle sebe -> carka uprostred
        - vedle cisla je ikona -> carka uvnitr cisla
TODO: grid lepsi -> carka je vzdycky uprostrd, ale nevykresli se, pokud sousedi ikona s ikonou, nebo stone s border
*/
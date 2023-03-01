import {line} from './render.js';

class Icon {
    constructor(size, text, fontsize, fg, bg) {
        this.size = size;
        this.text = text;
        this.fontsize = fontsize;
        this.fg = fg;
        this.bg = bg;
    }

    grid(ctx, x, y) {
        const thickness = 1;
        const s = this.size;
        const shift = 4;
        const crop = 0.2 * s;
        line(ctx, x+crop, y+shift, x+s-crop, y+shift, thickness, "rgb(100, 100, 100)");  // top
        line(ctx, x+crop, y+s-shift, x+s-crop, y+s-shift, thickness, "rgb(100, 100, 100)");  // bot
        line(ctx, x+shift, y+crop, x+shift, y+s-crop, thickness, "rgb(100, 100, 100)");  // left
        line(ctx, x+s-shift, y+crop, x+s-shift, y+s-crop, thickness, "rgb(100, 100, 100)");  // right
    }

    render(ctx, x, y) {
        ctx.clearRect(x-1, y-1, this.size+2, this.size+2);
        if (this.bg != null) {
            ctx.beginPath();
            ctx.fillStyle = this.bg;
            let g = 5;
            ctx.roundRect(x, y, this.size, this.size, [g, g, g, g]);
            ctx.fill();
        }
        if (this.fg != null && this.text != null) {
            ctx.fillStyle = this.fg;
            ctx.font = `${this.fontsize}px Helvetica`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(this.text, x + this.size/2, y + this.size/2);
        }
        // this.grid(ctx, x, y)
    }
}


class Number extends Icon {
    constructor(size, value, fontsize, fg) {
        super(size, value == 0 ? null : value.toString(), fontsize, fg, null);
        this.value = value;
    }

    inc() {
        this.value += 1;
        this.text = this.value.toString();
    }
}

export {Icon, Number};
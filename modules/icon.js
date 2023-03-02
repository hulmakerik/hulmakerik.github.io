
class Icon {
    constructor(text, fg, bg) {
        this.text = text;
        this.fg = fg;
        this.bg = bg;
    }

    render(ctx, x, y, s) {
        if (this.bg != null) {
            ctx.beginPath();
            ctx.fillStyle = this.bg;
            let g = 5;
            ctx.roundRect(x, y, s, s, [g, g, g, g]);
            ctx.fill();
        }
        if (this.fg != null && this.text != null) {
            ctx.fillStyle = this.fg;
            ctx.fillText(this.text, x + s/2, y + s/2);
        }
    }
}


export {Icon};
const SType = {
    free: 'free',
    mine: 'mine',
    border: 'border',
}

const SState = {
    hidden: 'hidden',
    flagged: 'flagged',
    revealed: 'revealed',
}

class Stone {
    constructor(type=SType.free, state=SState.hidden) {
        console.assert(SState.hasOwnProperty(state), "Invalid state: " + state);
        console.assert(SType.hasOwnProperty(type), "Invalid type: " + type);
        this.neigh = [];
        this.reset(type, state);
    }

    reset (type=SType.free, state=SState.hidden) {
        this.type = type;
        this.state = state;
        this.danger = 0;   // number of mines
        this.value = 0;    // number of remaining mines
    }

    setNeighbors(neigh) {
        console.assert(neigh.length == 8, "Invalid number of neighbors: " + neigh.length)
        this.neigh = neigh;
        this.danger = neigh.filter(n => n.type == SType.mine).length;
        this.value = this.danger;
    }

    inc() { this.value += 1; }
    dec() { this.value -= 1; }

    reveal(force=false) {
        if (this.state == SState.hidden || (this.state == SState.revealed && force)) {
            this.state = SState.revealed;
            if (this.type == SType.free && this.value <= 0)
                this.neigh.forEach(n => n.reveal(false));
        }
    }

    toggleFlag() {
        if (this.state == SState.hidden) {
            this.state = SState.flagged;
            this.neigh.forEach(n => n.dec());
        } else if (this.state == SState.flagged) {
            this.state = SState.hidden;
            this.neigh.forEach(n => n.inc());
        }
    }

    landMine() {
        if (this.type == SType.free) {
            this.type = SType.mine;
            this.neigh.forEach(n => {n.danger++; n.inc();});
            return true;
        }
        return false;
    }
}

export {Stone, SState, SType};
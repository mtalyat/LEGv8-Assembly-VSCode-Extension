export class Simulation {
    text: string;

    public constructor(text: string) {
        this.text = text;
    }

    public print() {
        console.log(this.text);
    }
}

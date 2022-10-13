export class Stopwatch {
    private _startTime: number;
    private _stopTime: number;

    private _isRunning: boolean;

    public constructor() {
        this._startTime = 0.0;
        this._stopTime = 0.0;
        this._isRunning = false;
    }

    private now(): number {
        return new Date().getTime();
    }

    private update(): void {
        this._stopTime = this.now();
    }

    public elapsed(): number {
        if (this._isRunning) {
            this.update();
        }

        return this._stopTime - this._startTime;
    }

    public elapsedSeconds(): number {
        return this.elapsed() / 1000;
    }

    public reset(): void {
        this._startTime = this.now();
        this._stopTime = this.now();
    }

    public start(): void {
        if (!this._isRunning) {
            this._isRunning = true;

            this._startTime = this.now();
            this._stopTime = this.now();
        }
    }

    public restart(): void {
        this.reset();
        this.start();
    }

    public stop(): void {
        if (this._isRunning) {
            this._isRunning = false;

            this.update();
        }
    }
}
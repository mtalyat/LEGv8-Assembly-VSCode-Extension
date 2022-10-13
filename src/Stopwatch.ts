/**
 * Measures elapsed time in milliseconds.
 */
export class Stopwatch {
    /**
     * The start time in milliseconds.
     */
    private _startTime: number;
    /**
     * The stop time in milliseconds.
     */
    private _stopTime: number;

    /**
     * Is the Stopwatch running?
     */
    private _isRunning: boolean;

    /**
     * Creates a new Stopwatch.
     */
    public constructor() {
        this._startTime = 0.0;
        this._stopTime = 0.0;
        this._isRunning = false;
    }

    /**
     * Gets the current date time in milliseconds.
     * @returns the current time in milliseconds.
     */
    private now(): number {
        return new Date().getTime();
    }

    /**
     * Updates the stop time with the current date time.
     */
    private update(): void {
        this._stopTime = this.now();
    }

    /**
     * Gets the amount of time that has passed since the Stopwatch was started, in milliseconds.
     * @returns the amount of time that has elapsed in milliseconds.
     */
    public elapsed(): number {
        if (this._isRunning) {
            this.update();
        }

        return this._stopTime - this._startTime;
    }

    /**
     * Gets the amount of time that has passed since the Stopwatch was started, in seconds.
     * @returns the amount of time that has elapsed in seconds.
     */
    public elapsedSeconds(): number {
        return this.elapsed() / 1000;
    }

    /**
     * Resets the Stopwatch back to 0.0ms.
     */
    public reset(): void {
        this._startTime = this.now();
        this._stopTime = this.now();
    }

    /**
     * Starts measuring time.
     */
    public start(): void {
        if (!this._isRunning) {
            this._isRunning = true;

            this._startTime = this.now();
            this._stopTime = this.now();
        }
    }

    /**
     * Resets the Stopwatch, and then starts it.
     */
    public restart(): void {
        this.reset();
        this.start();
    }

    /**
     * Stops measuring time.
     */
    public stop(): void {
        if (this._isRunning) {
            this._isRunning = false;

            this.update();
        }
    }
}
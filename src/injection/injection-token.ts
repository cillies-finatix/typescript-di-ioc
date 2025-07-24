export class InjectionToken<T> {
    private actualType?: T;

    constructor(protected _desc: string) {}

    getType(): T | undefined {
        return this.actualType;
    }

    toString(): string {
        return `InjectionToken ${this._desc}`;
    }
}

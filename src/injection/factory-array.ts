export interface FactoryArray<T> extends Array<() => T> {
    multi?: boolean;
}
import { Type } from './type';

// Provider Typen
export interface ValueProvider<T> {
    provide: any;
    useValue: T;
    multi?: boolean;
}

export interface ClassProvider<T> {
    provide: any;
    useClass: Type<T>;
    deps?: any[];
    multi?: boolean;
}

export interface ExistingProvider {
    provide: any;
    useExisting: any;
    multi?: boolean;
}

export interface FactoryProvider<T> {
    provide: any;
    useFactory: (...args: any[]) => T;
    deps?: any[];
    multi?: boolean;
}

export interface TypeProvider<T> extends Type<T> {
    deps?: any[];
}

export type Provider<T = any> = 
    | TypeProvider<T> 
    | ValueProvider<T> 
    | ClassProvider<T> 
    | ExistingProvider 
    | FactoryProvider<T>;

import { InjectionToken } from './injection-token';
import { Type } from './type';
import { Provider } from './providers';
import { FactoryArray } from './factory-array';

export class Injector {
    readonly #parent: Injector | null = null;

    constructor(parent?: Injector) {
        // Wenn ein Parent-Injector angegeben ist, dann wird dieser
        // als Fallback verwendet, wenn der aktuelle Injector eine
        // Dependency nicht auflösen kann.
        if (parent) {
            this.#parent = parent;
        }
    }

    // interne Liste von #Factories und erzeugten Instanzen
    // Auch hier wird das Singleton Entwurfsmuster verfolgt.
    readonly #factories: Map<any, any> = new Map();
    readonly #instances: Map<any, any> = new Map();
    
    // Injector mit Provider-Liste erzeugen.
    static resolveAndCreate(providerConfig: Provider[], parent?: Injector): Injector {
        const injector = new Injector(parent);

        for (const provider of providerConfig) {
            const factory = this.#createFactory(provider, injector);

            const id = this.#getToken(provider);
            if ("multi" in provider && provider.multi === true) {
                const multiFactory: FactoryArray<any> = injector.#factories.get(id) ?? [];
                multiFactory.multi = true;
                multiFactory.push(factory);
                injector.#factories.set(id, multiFactory);
            } else {
                injector.#factories.set(id, factory);
            }
        }
        return injector;
    }

    static #getToken(provider: Provider): unknown {
        return "provide" in provider ? provider.provide : provider;
    }

    static #createFactory(provider: Provider, injector: Injector) {
        // Existing Provider nutzen einfach den "bekannten" Provider
        if ("useExisting" in provider && provider.useExisting) {
            return () => injector.inject(provider.useExisting);
        }
        // Value Provider, geben den Wert einfach zurück ohne Instantiierung
        if ("useValue" in provider && provider.useValue) {
            return () => provider.useValue;
        }

        let deps: any[] = [];
        let fac: Function;

        if ("useFactory" in provider && provider.useFactory) {
            deps = provider.deps ?? [];
            fac = provider.useFactory;
        } else {
            let clazz: any = provider;
            if ("useClass" in provider && provider.useClass) {
                clazz = provider.useClass;
            }
            if ("deps" in clazz) {
                // Da keine Reflection verwendet wird,
                // brauchen wir irgendwo die Dependencies im JavaScript.
                deps = clazz.deps ?? [];
            }
            fac = (...deps: any[]) => new clazz(...deps);
        }

        return () => {
            const resolvedDeps = deps.map((dep: any) => injector.inject(dep));
            return fac(...resolvedDeps)
        };
    }

    // Dependency holen - mit Typ
    inject<T>(providerId: InjectionToken<T> | Type<T>): T {
        if (!this.#factories.has(providerId)) {
            try {
                // Wenn der Provider nicht im aktuellen Injector gefunden wurde,
                // dann wird der Parent-Injector nach dem Provider durchsucht.
                if (this.#parent) {
                    return this.#parent.inject(providerId);
                }
            } catch {}

            throw new Error('Could not resolve provider');
        }

        // Singleton: Es wird immer nur eine Provider Instanz erzeugt.
        if (!this.#instances.has(providerId)) {
            const factory = this.#factories.get(providerId);
            let instance: any;
            if (factory.multi) {
                instance = this.#createProviderByMultiFactory(factory)
            } else {
                instance = this.#createProviderByFactory(factory);
            }
            this.#instances.set(providerId, instance);
        }

        return this.#instances.get(providerId) as T;
    }

    #createProviderByFactory<T>(factory: () => T): T {
        try {
            return factory();
        } catch (err:unknown) {
            if (err instanceof Error) {
                throw new Error(`Could not create provider: ${err.message}`);
            }
            throw new Error(`Could not create provider}`);
        }
    }

    #createProviderByMultiFactory<T>(factories: FactoryArray<T>): T[] {
        const multiProviders = [];
        for (const factory of factories) {
            multiProviders.push(this.#createProviderByFactory(factory));
        }
        return multiProviders;
    }
}
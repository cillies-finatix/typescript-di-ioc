import { InjectionToken } from './injection-token';
import { Type } from './type';
import { Provider } from './providers';
import { FactoryArray } from './factory-array';

export class Injector {
    // Singletone Injector
    private static instance?: Injector;

    static getInstance() {
        if (!Injector.instance) {
            Injector.instance = new Injector();
        }

        return Injector.instance;
    }

    //
    static destroy() {
        if (Injector.instance) {
            Injector.instance.factories.clear();
            Injector.instance.instances.clear();
        }
        Injector.instance = undefined;
    }

    // Injector mit Provider-Liste erzeugen.
    static resolveAndCreate(providerConfig: Provider[], parent?: Injector): Injector {
        const injector = parent ?? Injector.getInstance();

        for (const provider of providerConfig) {
            const factory = this.createFactory(provider, injector);

            const id: any = this.getToken(provider);
            if ("multi" in provider && provider.multi === true) {
                const multiFactory: FactoryArray<any> = injector.factories.get(id) ?? [];
                multiFactory.multi = true;
                multiFactory.push(factory);
                injector.factories.set(id, multiFactory);
            } else {
                injector.factories.set(id, factory);
            }
        }
        return injector;
    }

    private static getToken(provider: Provider) {
        return "provide" in provider ? provider.provide : provider;
    }

    private static createFactory(provider: Provider, injector: Injector) {
        // Existing Provider nutzen einfach den "bekannten" Provider
        if ("useExisting" in provider && provider.useExisting) {
            return () => injector.get(provider.useExisting);
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
            const resolvedDeps = deps.map((dep: any) => injector.get(dep));
            return fac(...resolvedDeps)
        };
    }

// Alias für `SimpleInjector.getInstance().get(...)`
    static get(provider: any) {
        return Injector.getInstance().get(provider);
    }

    // Alias für `SimpleInjector.getInstance().inject<T>(...)`
    static inject<T>(provider: InjectionToken<T> | Type<T>): T {
        return Injector.getInstance().inject<T>(provider);
    }

    // interne Liste von Factories und erzeugten Instanzen
    // Auch hier wird das Singleton Entwurfsmuster verfolgt.
    private readonly factories: Map<any, any> = new Map();
    private readonly instances: Map<any, any> = new Map();

    // Alias für `this.inject<any>(...)`
    get(provider: any): any {
        return Injector.getInstance().inject<any>(provider);
    }

    // Dependency holen - mit Typ
    inject<T>(providerId: InjectionToken<T> | Type<T>): T {
        if (!this.factories.has(providerId)) {
            throw new Error('Could not resolve provider');
        }

        // Singleton: Es wird immer nur eine Provider Instanz erzeugt.
        if (!this.instances.has(providerId)) {
            const factory = this.factories.get(providerId);
            let instance: any;
            if (factory.multi) {
                instance = this.createProviderByMultiFactory(factory)
            } else {
                instance = this.createProviderByFactory(factory);
            }
            this.instances.set(providerId, instance);
        }

        return this.instances.get(providerId) as T;
    }

    private createProviderByFactory<T>(factory: () => T): T {
        try {
            return factory();
        } catch (err:unknown) {
            if (err instanceof Error) {
                throw new Error(`Could not create provider: ${err.message}`);
            }
            throw new Error(`Could not create provider}`);
        }
    }

    private createProviderByMultiFactory<T>(factories: FactoryArray<T>): T[] {
        const multiProviders = [];
        for (const factory of factories) {
            multiProviders.push(this.createProviderByFactory(factory));
        }
        return multiProviders;
    }
}
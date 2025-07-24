import {Injector} from "./injection/injector";
import {providerConfig} from "./provider-config";
import {Application} from "./application";

const injector = Injector.resolveAndCreate(providerConfig);
injector.inject(Application).init();
import {Application} from "./application";
import {Routing} from "./services/routing";
import {EventListener} from "./services/event-listener";
import {DB_CONFIG_TOKEN} from "./db/db-config";
import {DB_CONNECT_TOKEN} from "./db/db-connection";

const createDbConnection = (dbConfig: string) => {
    console.log('createDbConnection with dbConfig:', dbConfig);
    return { query: () => true };
};

export const providerConfig = [
    Application,
    { provide: Routing, useClass: Routing },
    EventListener,
    { provide: DB_CONNECT_TOKEN, useFactory: createDbConnection, deps: [DB_CONFIG_TOKEN] },
    { provide: DB_CONFIG_TOKEN, useValue: 'jdbc://mysql:123@321' },
];

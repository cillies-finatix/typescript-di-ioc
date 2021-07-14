import {Injector} from "./services/injector";
import {Application} from "./application";
import {Routing} from "./services/routing";
import {EventListener} from "./services/event-listener";
import {DB_CONNECT_TOKEN} from "./db/db-connection";

describe('Application', () => {
    let injector: Injector;
    let app: Application;

    beforeEach(() => {
        injector = Injector.resolveAndCreate([
            Application,
            {
                provide: Routing,
                useValue: {
                    start: jest.fn(),
                }
            },
            {
                provide: EventListener,
                useValue: {
                    listen: jest.fn(),
                }
            },
            {
                provide: DB_CONNECT_TOKEN,
                useValue: {
                    query: jest.fn(() => true),
                }
            },
        ]);

        app = injector.inject(Application);
    });

    test('should start routing when initialising', () => {
        expect(injector.get(Routing).start.mock.calls.length).toEqual(0);
        app.init();
        expect(injector.get(Routing).start.mock.calls.length).toEqual(1);
    });
});
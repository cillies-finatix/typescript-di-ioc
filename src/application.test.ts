import {Injector} from "./injection/injector";
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
                    start: jest.fn(() => 'from_parent'),
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

    test('it should use and append parent and child injectors', () => {
        const childInjector = Injector.resolveAndCreate([
            {
                provide: Routing,
                useValue: {
                    start: jest.fn(() => 'from_child'),
                }
            }
        ], injector);

        expect(childInjector.get(Routing).start.mock.calls.length).toEqual(0);
        childInjector.inject(Application).init();
        expect(childInjector.get(Routing).start.mock.calls.length).toEqual(1);
        expect(childInjector.get(Routing).start()).toEqual('from_child');
    })
});
import {EventListener} from "./services/event-listener";
import {Routing} from "./services/routing";
import {DB_CONNECT_TOKEN} from "./db/db-connection";

export class Application {
    static deps = [Routing, EventListener, DB_CONNECT_TOKEN];

    // Goal: use inject methods
    /** *
    private routing: Routing = inject(Routing);
    private eventListener: EventListener = inject(EventListener);
    private dbConnection: { query: () => boolean } = inject(DB_CONNECT_TOKEN)
    /** */

    constructor(
        private routing: Routing,
        private eventListener: EventListener,
        private dbConnection: { query: () => boolean },
    ) {}

    init() {
        this.routing.start();
        this.eventListener.listen();
        console.log('App -> dbConnection.query:', this.dbConnection.query());
    }
}
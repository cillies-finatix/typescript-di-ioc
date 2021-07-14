import {Routing} from "./routing";

export class EventListener {
    static deps = [Routing];

    constructor(private routing: Routing) {}

    listen() {
        console.log('EventListener listens');
        const routingEvents = this.routing.events();
        console.log('Routing events', routingEvents.length);
    }
}
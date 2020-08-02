import { Publisher, TicketCreatedEvent, Subjects } from '@aabtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}

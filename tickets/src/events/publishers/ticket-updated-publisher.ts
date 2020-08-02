import { Publisher, Subjects, TicketUpdatedEvent } from '@aabtickets/common';

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
}

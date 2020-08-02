import { Publisher, OrderCreatedEvent, Subjects } from '@aabtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}

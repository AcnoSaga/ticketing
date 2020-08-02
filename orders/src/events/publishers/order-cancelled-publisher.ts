import { Publisher, OrderCancelledEvent, Subjects } from '@aabtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}

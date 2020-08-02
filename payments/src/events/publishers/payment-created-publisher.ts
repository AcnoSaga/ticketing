import { Publisher, Subjects, PaymentCreatedEvent } from '@aabtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}

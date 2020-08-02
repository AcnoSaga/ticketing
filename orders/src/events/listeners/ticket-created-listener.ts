import { Message } from 'node-nats-streaming';
import { Listener, TicketCreatedEvent, Subjects } from '@aabtickets/common';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
	readonly queueGroupName = queueGroupName;
	async onMessage(
		data: TicketCreatedEvent['data'],
		msg: Message
	): Promise<void> {
		const { id, title, price } = data;
		const ticket = Ticket.build({
			title,
			price,
			id,
		});
		await ticket.save();

		msg.ack();
	}
}

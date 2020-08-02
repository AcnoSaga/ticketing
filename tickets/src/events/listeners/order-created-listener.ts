import { Listener, OrderCreatedEvent, Subjects } from '@aabtickets/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;
	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// Find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// If no ticket, throw error
		if (!ticket) {
			throw new Error('Ticket not found');
		}

		// Mark the ticket as being reserved by setting it's orderId property
		ticket.set({ orderId: data.id });

		// Save the message
		await ticket.save();

		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			price: ticket.price,
			title: ticket.title,
			userId: ticket.userId,
			version: ticket.version,
			orderId: ticket.orderId,
		});

		// Ack the message
		msg.ack();
	}
}

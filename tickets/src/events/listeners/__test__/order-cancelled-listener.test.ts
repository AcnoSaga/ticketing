import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import {
	OrderCreatedEvent,
	OrderStatus,
	OrderCancelledEvent,
} from '@aabtickets/common';
import { Message } from 'node-nats-streaming';
import { OrderCancelledListener } from '../order-cancelled-listener';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCancelledListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		price: 20,
		title: 'Concert',
		userId: mongoose.Types.ObjectId().toHexString(),
	});

	ticket.set({ orderId: mongoose.Types.ObjectId().toHexString() });
	await ticket.save();

	// Create fake data event
	// Create a fake data event
	const data: OrderCancelledEvent['data'] = {
		version: 0,
		id: mongoose.Types.ObjectId().toHexString(),

		ticket: {
			id: ticket.id,
		},
	};

	// Create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('clears the orderId of the ticket', async () => {
	const { listener, data, msg, ticket } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).toBeUndefined();
});

it('acks a message', async () => {
	const { listener, data, msg } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Make sure the ack function was called
	expect(msg.ack).toHaveBeenCalled();
});

it('publishes a ticket updated event', async () => {
	const { listener, data, msg } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

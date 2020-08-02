import { OrderCreatedListener } from '../order-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { Ticket } from '../../../models/ticket';
import mongoose from 'mongoose';
import { OrderCreatedEvent, OrderStatus } from '@aabtickets/common';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	// Create an instance of the listener
	const listener = new OrderCreatedListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		price: 20,
		title: 'Concert',
		userId: mongoose.Types.ObjectId().toHexString(),
	});
	await ticket.save();

	// Create fake data event
	// Create a fake data event
	const data: OrderCreatedEvent['data'] = {
		version: 0,
		id: mongoose.Types.ObjectId().toHexString(),
		expiresAt: '',
		status: OrderStatus.Created,
		ticket: {
			id: ticket.id,
			price: 20,
		},
		userId: mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

it('sets the orderId of the ticket', async () => {
	const { listener, data, msg, ticket } = await setup();

	await listener.onMessage(data, msg);

	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket!.orderId).toEqual(data.id);
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

	const ticketUpdatedData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);

	expect(data.id).toEqual(ticketUpdatedData.orderId);
});

import mongoose from 'mongoose';
import { TicketCreatedListener } from '../ticket-created-listener';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedEvent } from '@aabtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = () => {
	// Creates an instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// Create a fake data event
	const data: TicketCreatedEvent['data'] = {
		version: 0,
		id: new mongoose.Types.ObjectId().toHexString(),
		price: 20,
		title: 'concert',
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

it('creates and saves a ticket', async () => {
	const { listener, data, msg } = setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Write assertions to make sure a ticket was created
	const ticket = await Ticket.findById(data.id);

	expect(ticket).toBeDefined();
	expect(ticket!.title).toEqual(data.title);
	expect(ticket!.price).toEqual(data.price);
});

it('acks a message', async () => {
	const { listener, data, msg } = setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Make sure the ack function was called
	expect(msg.ack).toHaveBeenCalled();
});

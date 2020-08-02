import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedEvent } from '@aabtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { TicketUpdatedListener } from '../ticket-updated-listener';

const setup = async () => {
	// Creates an instance of the listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	// Create and save a ticket
	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		price: 20,
		title: 'concert',
	});
	await ticket.save();
	// Create a fake data event
	const data: TicketUpdatedEvent['data'] = {
		version: ticket.version + 1,
		id: ticket.id,
		price: 30,
		title: 'concert 2',
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// Create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket };
};

it('finds, updates and saves a ticket', async () => {
	const { listener, data, msg, ticket } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Write assertions to make sure a ticket was created
	const updatedTicket = await Ticket.findById(ticket.id);

	expect(updatedTicket).toBeDefined();
	expect(updatedTicket!.title).toEqual(data.title);
	expect(updatedTicket!.price).toEqual(data.price);
	expect(updatedTicket!.version).toEqual(data.version);
});

it('acks a message', async () => {
	const { listener, data, msg } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Make sure the ack function was called
	expect(msg.ack).toHaveBeenCalled();
});

it('does not ack if the event has a skipped version number', async () => {
	const { listener, data, msg } = await setup();

	data.version = 10;
	try {
		await listener.onMessage(data, msg);
	} catch (err) {}

	expect(msg.ack).not.toHaveBeenCalled();
});

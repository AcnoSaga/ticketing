import request from 'supertest';
import { Ticket } from '../ticket';

it('implements optimistic concurrency control', async () => {
	// Create an instance of a ticket
	const ticket = Ticket.build({
		price: 20,
		title: 'sa',
		userId: '123',
	});

	// Save the ticket to the database
	await ticket.save();

	// Fetch the ticket twice
	const firstInstance = await Ticket.findById(ticket.id);
	const secondInstance = await Ticket.findById(ticket.id);

	// Make two separate changes to the ticket
	firstInstance!.set({ price: 10 });
	firstInstance!.set({ price: 30 });

	// Save the first fetched ticket
	await firstInstance!.save();

	// Save the second fetched ticket and expect an error

	await expect(secondInstance!.save()).rejects.toThrow();
});

it('increments the version number on multiple saves', async () => {
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: 'ABC',
	});

	await ticket.save();
	expect(ticket.version).toEqual(0);

	await ticket.save();
	expect(ticket.version).toEqual(1);

	await ticket.save();
	expect(ticket.version).toEqual(2);
});

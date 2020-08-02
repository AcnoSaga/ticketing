import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';

it('returns an error if the ticket does not exist', async () => {
	const ticketId = mongoose.Types.ObjectId();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId,
		})
		.expect(404);
});

it('returns an error if the ticket is already reserved', async () => {
	const title = 'sasa';
	const price = 20;
	const id = new mongoose.Types.ObjectId().toHexString();

	const ticket = Ticket.build({ price, title, id });
	await ticket.save();

	const order = Order.build({
		ticket,
		userId: 'ijdqwjdhas',
		expiresAt: new Date(),
		status: OrderStatus.Created,
	});

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send();

	await order.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id,
		})
		.expect(400);
});

it('reserves a ticket', async () => {
	const title = 'sasa';
	const price = 20;
	const id = new mongoose.Types.ObjectId().toHexString();

	const ticket = Ticket.build({ price, title, id });
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id,
		})
		.expect(201);
});

it('emits an order created event', async () => {
	const title = 'sasa';
	const price = 20;
	const id = new mongoose.Types.ObjectId().toHexString();

	const ticket = Ticket.build({ price, title, id });
	await ticket.save();

	await request(app)
		.post('/api/orders')
		.set('Cookie', global.signin())
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

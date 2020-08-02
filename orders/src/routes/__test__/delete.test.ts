import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticket';
import { Order, OrderStatus } from '../../models/order';
import { natsWrapper } from '../../nats-wrapper';
import mongoose from 'mongoose';

it('marks an order as cancelled', async () => {
	// Create a ticket with the Ticket model
	const title = 'sasa';
	const price = 20;
	const id = mongoose.Types.ObjectId().toHexString();

	// Create the order
	const ticket = Ticket.build({ title, price, id });
	await ticket.save();

	const user = global.signin();

	// Make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	// Make  a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204);

	// Expectation to make sure the ticket is cancelled
	const updatedOrder = await Order.findById(order.id);

	expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emits an order cancelled event', async () => {
	// Create a ticket with the Ticket model
	const title = 'sasa';
	const price = 20;
	const id = mongoose.Types.ObjectId().toHexString();

	// Create the order
	const ticket = Ticket.build({ title, price, id });
	await ticket.save();

	const user = global.signin();

	// Make a request to create an order
	const { body: order } = await request(app)
		.post('/api/orders')
		.set('Cookie', user)
		.send({
			ticketId: ticket.id,
		})
		.expect(201);

	// Make  a request to cancel the order
	await request(app)
		.delete(`/api/orders/${order.id}`)
		.set('Cookie', user)
		.send()
		.expect(204);

	expect(natsWrapper.client.publish).toHaveBeenCalled();
});

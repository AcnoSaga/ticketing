import mongoose from 'mongoose';
import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteEvent, OrderStatus } from '@aabtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Order } from '../../../models/order';

const setup = async () => {
	// Creates an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: mongoose.Types.ObjectId().toHexString(),
		price: 20,
		title: 'concert',
	});
	await ticket.save();

	const order = Order.build({
		ticket: ticket,
		userId: mongoose.Types.ObjectId().toHexString(),
		expiresAt: new Date(),
		status: OrderStatus.Created,
	});
	await order.save();

	// Create a fake data event
	const data: ExpirationCompleteEvent['data'] = {
		orderId: order.id,
	};

	// Create a fake message object
	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, order, ticket, data, msg };
};

it('updates the order status to cancelled', async () => {
	const { listener, data, msg, order } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	const fetchedOrder = await Order.findById(order.id);

	// Write assertions to make sure the order status was changed to cancelled
	expect(fetchedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it('emit an OrderCancelled event', async () => {
	const { listener, data, msg, order } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	expect(natsWrapper.client.publish).toHaveBeenCalled();

	const eventData = JSON.parse(
		(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
	);
	expect(eventData.id).toEqual(order.id);
});

it('acks the message', async () => {
	const { listener, data, msg } = await setup();

	// Call the onMessage function with the data object and the message object
	await listener.onMessage(data, msg);

	// Make sure the ack function was called
	expect(msg.ack).toHaveBeenCalled();
});

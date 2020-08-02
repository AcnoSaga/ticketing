import { Message } from 'node-nats-streaming';
import {
	Listener,
	Subjects,
	PaymentCreatedEvent,
	OrderStatus,
} from '@aabtickets/common';
import { queueGroupName } from './queue-group-name';
import { Order } from '../../models/order';

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
	readonly queueGroupName = queueGroupName;
	async onMessage(
		data: PaymentCreatedEvent['data'],
		msg: Message
	): Promise<void> {
		const order = await Order.findById(data.orderId);
		if (!order) {
			throw new Error('Order not found');
		}
		order.set({
			status: OrderStatus.Complete,
		});
		await order.save();
		msg.ack();
	}
}

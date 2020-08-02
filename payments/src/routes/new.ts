import express, { Request, Response } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	NotAuthorizedError,
	OrderStatus,
	BadRequestError,
} from '@aabtickets/common';
import { body } from 'express-validator';
import { Order } from '../models/order';
import { stripe } from '../stripe';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post(
	'/api/payments',
	requireAuth,
	[body('token').notEmpty(), body('orderId').notEmpty()],
	validateRequest,
	async (req: Request, res: Response) => {
		const { token, orderId } = req.body;
		console.log(token);
		const order = await Order.findById(orderId);

		if (!order) {
			throw new NotFoundError();
		}
		if (order.userId !== req.currentUser!.id) {
			throw new NotAuthorizedError();
		}
		if (order.status === OrderStatus.Cancelled) {
			throw new BadRequestError('Cannot pay for a cancelled order');
		}

		const charge = await stripe.charges.create({
			currency: 'inr',
			amount: order.price * 100,
			source: token,
			description: 'Order for ticket',
		});
		const payment = Payment.build({
			orderId,
			stripeId: charge.id,
		});
		await payment.save();
		await new PaymentCreatedPublisher(natsWrapper.client).publish({
			id: payment.id,
			orderId: payment.orderId,
			stripeId: payment.stripeId,
		});

		res.status(201).send({ id: payment.id });
	}
);

export { router as createChargeRouter };

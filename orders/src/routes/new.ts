import express, { Request, Response } from 'express';
import {
	requireAuth,
	validateRequest,
	NotFoundError,
	OrderStatus,
	BadRequestError,
} from '@aabtickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticket';
import { Order } from '../models/order';
import { OrderCreatedPublisher } from '../events/publishers/order-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

const EXPIRATION_WINDOW_SECONDS = 60;

router.post(
	'/api/orders',
	requireAuth,
	[body('ticketId').notEmpty().withMessage('Ticket ID must be provided')],
	validateRequest,
	async (req: Request, res: Response) => {
		const { ticketId } = req.body;

		// Find the ticket the user is trying to order in the database
		const ticket = await Ticket.findById(ticketId);

		if (!ticket) {
			throw new NotFoundError();
		}

		// Make sure the ticket is not already reserved
		const isReserved = await ticket.isReserved();

		if (isReserved) {
			throw new BadRequestError('Ticket is already reserved');
		}

		// Calculate an expiration date for this order
		const expiration = new Date();
		expiration.setSeconds(
			expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS
		);

		// Build the order and save it to the databases
		const order = Order.build({
			ticket,
			userId: req.currentUser!.id,
			expiresAt: expiration,
			status: OrderStatus.Created,
		});

		await order.save();

		// Publish an event saying that an order was created
		new OrderCreatedPublisher(natsWrapper.client).publish({
			id: order.id,
			status: order.status,
			ticket: {
				id: ticket.id,
				price: ticket.price,
			},
			userId: order.userId,
			expiresAt: order.expiresAt.toISOString(),
			version: order.version,
		});

		return res.status(201).send(order);
	}
);

export { router as newOrderRouter };

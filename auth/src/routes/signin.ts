import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { validateRequest } from '@aabtickets/common';
import { User } from '../models/user';
import { BadRequestError } from '@aabtickets/common';
import { Password } from '../services/password';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post(
	'/api/users/signin',
	[
		body('email').isEmail().withMessage('Email must be valid'),
		body('password')
			.trim()
			.notEmpty()
			.withMessage('You must supply a password'),
	],
	validateRequest,
	async (req: Request, res: Response) => {
		const {
			email,
			password,
		}: { email: string; password: string } = req.body;

		const existingUser = await User.findOne({ email });

		if (!existingUser) {
			throw new BadRequestError('Invalid credentials');
		}

		const passwordsMatch = await Password.compare(
			existingUser.password,
			password
		);

		if (!passwordsMatch) {
			throw new BadRequestError('Invalid credentials');
		}
		// Generate JWT
		const userJwt = jwt.sign(
			{
				id: existingUser.id,
				email: existingUser.email,
			},
			process.env.JWT_KEY!
		);

		// Store in session object
		req.session = {
			jwt: userJwt,
		};

		return res.status(200).send(existingUser);
	}
);

export { router as signinRouter };

import express, { Request, Response } from 'express';

import { currentUser } from '@aabtickets/common';

const router = express.Router();

router.get(
	'/api/users/currentuser',
	currentUser,
	(req: Request, res: Response) => {
		return res.send({ currentUser: req.currentUser ?? null });
	}
);

export { router as currentUserRouter };

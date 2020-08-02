import {
	Publisher,
	ExpirationCompleteEvent,
	Subjects,
} from '@aabtickets/common';

export class ExpirationCompletePublisher extends Publisher<
	ExpirationCompleteEvent
> {
	readonly subject = Subjects.ExpirationComplete;
}

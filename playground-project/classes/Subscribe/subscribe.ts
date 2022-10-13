import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { Subscriber } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient(
	"32812873-aa64-463f-b06e-3166cb5cd6e7"
);

export async function getSubscribers(
	data: Data<any, any, any, { subscribers: Subscriber[] }>
): Promise<Data> {
	data.response = {
		statusCode: 200,
		body: {
			subscribers: data.state.private.subscribers,
		},
	};
	return data;
}

export async function preSubscribe(
	data: Data<Subscriber, any, any, { preSubscribers: Subscriber[] }>
): Promise<Data> {
	// check if there is already a subscriber with the same email
	let subscriber = data.state.private.preSubscribers.find(
		(s) => s.email === data.request.body.email
	);

	// if there is a subscriber with the same email
	if (subscriber) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is already registered to preSubscribers",
			},
		};
	}

	// if there is no subscriber with the same email
	else {
		const preSubscriber: Subscriber = {
			email: data.request.body.email,
			createdAt: Date.now(),
			isApproved: false,
		};
		data.state.private.preSubscribers.push(preSubscriber);
		// send mail to preSubscriber's mail to confirm subscription
		await client.sendEmail({
			From: "denizhan@rettermobile.com",
			To: preSubscriber.email,
			Subject: "Confirm your subscription",
			TextBody:
				"Confirm your subscription by clicking the link below \n https://rettermobile.com/subscribe/confirm",
		});

		data.response = {
			statusCode: 200,
			body: {
				status: "New preSubscriber added to preSubscribers",
			},
		};
	}
	// send mail to new preSubscriber

	return data;
}

export async function subscribe(
	data: Data<Subscriber, any, any, { preSubscribers: Subscriber[] }>
): Promise<Data> {
	// check if user already registered to subscribers
	let subscriber = data.state.private.preSubscribers.find(
		(s) => s.email === data.request.body.email
	);

	if (!subscriber) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is not in the preSubscribers",
			},
		};
	} else {
		data.state.private.preSubscribers =
			data.state.private.preSubscribers.filter(
				(s) => s.email !== data.request.body.email
			);
		subscriber.isApproved = true;
		data.state.private.subscribers.push(subscriber);
		data.response = {
			statusCode: 200,
			body: {
				status: "New subscriber added to subscribers",
			},
		};
	}

	return data;
}

export async function unSubscribe(
	data: Data<Subscriber, any, any, { subscribers: Subscriber[] }>
): Promise<Data> {
	// check if user already registered to subscribers
	let subscriber = data.state.private.subscribers.find(
		(s) => s.email === data.request.body.email
	);

	if (!subscriber) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is not in the subscribers",
			},
		};
	} else {
		data.state.private.subscribers = data.state.private.subscribers.filter(
			(s) => s.email !== data.request.body.email
		);
		data.response = {
			statusCode: 200,
			body: {
				status: "Subscriber removed from subscribers",
			},
		};
	}

	return data;
}

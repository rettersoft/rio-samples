import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { Subscriber } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN); // you put yours in Settings -> Enviroment (c.retter.io)

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
	data: Data<
		Subscriber,
		any,
		any,
		{ preSubscribers: Subscriber[]; subscribers: Subscriber[] }
	>
): Promise<Data> {
	// check if there is already a subscriber or presubscriber with the same email
	let subscriber = data.state.private.preSubscribers.find(
		(s) => s.email === data.request.body.email
	);
	if (!subscriber) {
		subscriber = data.state.private.subscribers.find(
			(s) => s.email === data.request.body.email
		);
	}

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
			HtmlBody: `<html> <body> <h1>Confirm your subscription</h1> <p>Click <a href="https://${data.context.projectId}.api.retter.io/${data.context.projectId}/CALL/Subscribe/subscribe/defaultInstance?email=${preSubscriber.email}">Validate</a> to confirm your subscription</p> </body> </html>`,
			TextBody: `Confirm your subscription by clicking the link below \n https://${data.context.projectId}.api.retter.io/${data.context.projectId}/CALL/Subscribe/subscribe/defaultInstance?email=${preSubscriber.email}`,
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
	data: Data<
		Subscriber,
		any,
		any,
		{ preSubscribers: Subscriber[]; subscribers: Subscriber[] }
	>
): Promise<Data> {
	// check if user already registered to subscribers
	let subscriber = data.state.private.preSubscribers.find(
		(s) => s.email === data.request.queryStringParams.email
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
				(s) => s.email !== data.request.queryStringParams.email
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

/**
 * @description Removes the subscriber to its email, from the preSubscribers and subscribers
 */
export async function unSubscribe(
	data: Data<
		Subscriber,
		any,
		any,
		{ subscribers: Subscriber[]; preSubscribers: Subscriber[] }
	>
): Promise<Data> {
	// check if user already registered to subscribers
	let subscriber = data.state.private.subscribers.find(
		(s) => s.email === data.request.body.email
	);
	if (!subscriber) {
		subscriber = data.state.private.preSubscribers.find(
			(s) => s.email === data.request.body.email
		);
	}

	if (!subscriber) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is not in the subscribers or preSubscribers",
			},
		};
	} else {
		data.state.private.subscribers = data.state.private.subscribers.filter(
			(s) => s.email !== data.request.body.email
		);
		data.state.private.preSubscribers =
			data.state.private.preSubscribers.filter(
				(s) => s.email !== data.request.body.email
			);
		data.response = {
			statusCode: 200,
			body: {
				status: "Subscriber has removed from subscribers and presSubscribers",
			},
		};
	}

	return data;
}

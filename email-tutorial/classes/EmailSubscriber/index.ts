import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { SubscribeInputModel, Subscriber } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient(
	"32812873-aa64-463f-b06e-3166cb5cd6e7"
);

export async function authorizer(data: Data): Promise<Response> {
	return { statusCode: 200 };
}

export async function init(data: Data): Promise<InitResponse> {
	return {
		state: {
			private: {
				subscribers: [],
				preSubscribers: [],
			},
		},
	};
}

export async function getState(data: Data): Promise<Response> {
	return { statusCode: 200, body: data.state };
}

export async function getInstanceId(data: Data): Promise<string> {
	return "default";
}

export async function preSubscribe(
	data: Data<
		SubscribeInputModel,
		any,
		any,
		{ preSubscribers: Subscriber[]; subscribers: Subscriber[] }
	>
): Promise<StepResponse> {
	// check if user already registered to preSubscribers
	let isMember = data.state.private.preSubscribers.find(
		(m) => m.email === data.request.body.email
	);
	// if not int the preSubscribers check if it is in the subscribers
	if (!isMember) {
		isMember = data.state.private.subscribers.find(
			(m) => m.email === data.request.body.email
		);
	}
	// if the member we are trying to add is either in preSubscribers or subscribers
	if (isMember) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is already registered to preSubscribers",
				isMember,
			},
		};
	}
	// if not already already registered -> register to preSubsribers
	else {
		const preSubsciber: Subscriber = {
			email: data.request.body.email,
			createdAt: Date.now(),
		};

		data.state.private.preSubscribers.push(preSubsciber);
		data.response = {
			statusCode: 200,
			body: {
				status: "New preSubscriber added to preSubscribers",
			},
		};
	}
	return data;
}

export async function subscribe(
	data: Data<
		SubscribeInputModel,
		any,
		any,
		{ preSubscribers: Subscriber[]; subscribers: Subscriber[] }
	>
): Promise<StepResponse> {
	// check if user already registered to subscribers
	let isMember = data.state.private.subscribers.find(
		(m) => m.email === data.request.body.email
	);

	if (isMember) {
		data.response = {
			statusCode: 404,
			body: {
				status: "This member is already registered to subsribers",
				isMember,
			},
		};
	}

	isMember = data.state.private.preSubscribers.find(
		(m) => m.email === data.request.body.email
	);
	// check if the user is in presubscirbers
	if (!isMember) {
		data.response = {
			statusCode: 404,
			body: {
				status:
					"This member is not in the preSubscribers so can' t be added to subscribers",
				isMember,
			},
		};
	}
	// if in preSubscribers  add to subscribers and remove from preSubscribers
	else {
		data.state.private.subscribers.push(isMember);
		data.state.private.preSubscribers =
			data.state.private.preSubscribers.filter(
				(member) => member.email !== data.request.body.email
			);
		data.response = {
			statusCode: 200,
			body: {
				status: "New subscriber added from preSubsribers",
			},
		};
	}

	return data;
}

export async function unSubscribe(
	data: Data<
		SubscribeInputModel,
		any,
		any,
		{ preSubscribers: Subscriber[]; subscribers: Subscriber[] }
	>
): Promise<StepResponse> {
	// remove from both subsribers and preSubscribers
	data.state.private.subscribers = data.state.private.subscribers.filter(
		(member) => member.email !== data.request.body.email
	);
	data.state.private.preSubscribers = data.state.private.preSubscribers.filter(
		(member) => member.email !== data.request.body.email
	);
	return data;
}

export async function sendMailWeekly(
	data: Data<any, any, any, { subscribers: Subscriber[] }>
): Promise<StepResponse> {
	await Promise.all(
		data.state.private.subscribers.map(function (subsciber) {
			console.log(subsciber.email);

			return client.sendEmail({
				From: "denizhan@rettermobile.com",
				To: subsciber.email,
				Subject: "Test",
				TextBody: "Hello from Postmark!",
			});
		})
	);

	return data;
}

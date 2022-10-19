import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { Subscriber } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN); // you put yours in Settings -> Enviroment (c.retter.io)

/**
 * @description returns the subscribers list for other classes to use
 */
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

/**
 * @description creates a preSubscriber and sends a confirmation email
 */
export async function subscribe(
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
			HtmlBody: `
			<h1>Welcome</h1>
			<p>Thanks for trying Rio News. We’re thrilled to have you on board. To finish your register process, validate your account by clicking the link below:</p>
			<!-- Action -->
			<table class="body-action" align="center" width="100%" cellpadding="0" cellspacing="0">
			  <tr>
				<td align="center">
				  <!-- Border based button https://litmus.com/blog/a-guide-to-bulletproof-buttons-in-email-design -->
				  <table width="100%" border="0" cellspacing="0" cellpadding="0">
					<tr>
					  <td align="center">
						<table border="0" cellspacing="0" cellpadding="0">
						  <tr>
							<td>
								<a href="https://${data.context.projectId}.api.retter.io/${data.context.projectId}/CALL/Subscribe/validate/defaultInstance?email=${preSubscriber.email}">Validate</a>
							</td>
						  </tr>
						</table>
					  </td>
					</tr>
				  </table>
				</td>
			  </tr>
			</table>
			</table>
			`,
			//HtmlBody: `<html> <body> <h1>Confirm your subscription</h1> <p>Click <a href="https://${data.context.projectId}.api.retter.io/${data.context.projectId}/CALL/Subscribe/validate/defaultInstance?email=${preSubscriber.email}">Validate</a> to confirm your subscription</p> </body> </html>`,
			TextBody: `Confirm your subscription by clicking the link below \n https://${data.context.projectId}.api.retter.io/${data.context.projectId}/CALL/Subscribe/validate/defaultInstance?email=${preSubscriber.email}`,
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

/**
 * @description validates a preSubscriber and adds it to subscribers and removes from preSubscribers
 */
export async function validate(
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
				status: `New subscriber ${subscriber.email} added to subscribers`,
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

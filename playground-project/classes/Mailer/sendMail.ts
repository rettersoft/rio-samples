import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { Subscriber, Classes } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient("process.env.POSTMARK_API_KEY");

export async function sendMailToSubscribers(
	data: Data<any, any, any, { subscribers: Subscriber[] }>
): Promise<Data> {
	const subscribeInstance = await Classes.Subscribe.getInstance();
	const subscribers = await subscribeInstance.getSubscribers();
	const subscribersArray = subscribers.body.subscribers;

	let sendMailReturnValue;
	// create mail template
	const mailTemplate = {
		From: "denizhan@rettermobile.com",
		To: "",
		Subject: "Hi From Retter!",
		TextBody: "Hi there, here is your news this week: \n Blah Blah Blah",
	};

	// send mail to all subscribers
	subscribersArray.forEach((subscriber) => {
		mailTemplate.To = subscriber.email;
	});

	data.response = {
		statusCode: 200,
		body: {
			status: "Mail sent to all subscribers",
			sendMailReturnValue: sendMailReturnValue,
		},
	};

	return data;
}

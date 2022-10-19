import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";
import { Subscriber, Classes } from "./rio";
const postmark = require("postmark");
const rdk = new RDK();
const client = new postmark.ServerClient(process.env.POSTMARK_API_TOKEN); // you put yours in Settings -> Enviroment (c.retter.io)

/**
 * @description sends email to all subscribers
 */
export async function sendMailToSubscribers(
	data: Data<any, any, any, { subscribers: Subscriber[] }>
): Promise<Data> {
	const subscribeInstance = await Classes.Subscribe.getInstance();
	const subscribers = await subscribeInstance.getSubscribers();
	const subscribersArray = subscribers.body.subscribers;

	//create mail template
	const mailTemplate = {
		From: "denizhan@rettermobile.com",
		To: "",
		Subject: "Hi From Retter!",
		TextBody: "Hi there, here is your news this week: \n Blah Blah Blah",
	};

	await Promise.all(
		subscribersArray.map(async (subscriber) => {
			mailTemplate.To = subscriber.email;
			await client.sendEmail(mailTemplate);
		})
	);

	data.response = {
		statusCode: 200,
		body: {
			status: "Mail sent to all subscribers",
			subscribersArray,
		},
	};

	return data;
}

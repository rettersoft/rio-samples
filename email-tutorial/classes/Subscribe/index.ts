import RDK, { Data, InitResponse, Response, StepResponse } from "@retter/rdk";

const rdk = new RDK();

export async function authorizer(data: Data): Promise<Response> {
	return { statusCode: 401 };
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

export async function getInstanceId(data: Data): Promise<string> {
	return "defaultInstance";
}

export async function getState(data: Data): Promise<Response> {
	return { statusCode: 200, body: data.state };
}

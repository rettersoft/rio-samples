import test from "ava";
import { set as setProperty } from "dot-prop";
import { faker } from "@faker-js/faker";

import { preSubscribe, subscribe, unSubscribe } from "../subscribe";
import { brotliDecompressSync } from "zlib";
import { Data } from "@retter/rdk";

export const getMockedData = (): Data =>
	({
		context: {
			projectId: "testProject",
			classId: "testClassId",
			instanceId: "testInstanceId",
		},
		state: {
			private: {
				subscribers: [],
				preSubscribers: [],
			},
			public: {},
		},
		schedule: [],
		tasks: [],
	} as any);

test.serial(
	"preSubscribe => if not already registered ok",

	async (t) => {
		const data = {} as any;
		setProperty(data, "request.body.email", faker.internet.email());
		await preSubscribe(data);

		t.is(data.response.body.status, "New subscriber added to preSubscribers");
	}
);

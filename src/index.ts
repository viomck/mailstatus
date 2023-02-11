import notify from "./notify";
import receive from "./receive";
import refresh from "./refresh";
import send from "./send";

export interface Env {
	KV: KVNamespace
	ZOHO_USER_ID: string
	IFTTT_URL: string
	FROM_EMAIL: string
	TO_EMAILS: string
	CLIENT_ID: string
	CLIENT_SECRET: string
	ENVIRONMENT?: string
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	) {
		if (env.ENVIRONMENT !== "dev") {
			return new Response("No HTTP API available.");
		}

		if (request.url.includes("refresh")) {
			await refresh(env);
			return new Response("Refresh");
		} else if (request.url.includes("notify")) {
			await notify(env, "Test notification!");
			return new Response("Notify");
		}
		await this.scheduled(null as any, env, ctx);
		return new Response("OK");
	},

	async scheduled(
		controller: ScheduledController,
		env: Env,
		ctx: ExecutionContext
	): Promise<void> {
		try {
			await run(env);
		} catch {
			await refresh(env);

			try {
				await run(env);
			} catch (e) {
				await notify(env, "Mail check run failed: " + e);
			}
		}
	}
};

async function run(env: Env) {
	const testId = await env.KV.get("testId");
	
	if (testId) {
		await receive(env, testId);
	} else {
		await send(env);
	}
}

import notify from "./notify";
import receive from "./receive";
import refresh from "./refresh";
import send from "./send";

export interface Env {
	KV: KVNamespace
	IFTTT_URL: string
	FROM_EMAIL: string
	TO_EMAILS: string
	CLIENT_ID: string
	CLIENT_SECRET: string
	ENVIRONMENT?: string,
	WUPHF: Fetcher,
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	) {
		if (
			env.ENVIRONMENT !== "dev" && 
			request.headers.get("Authorization") != env.CLIENT_SECRET
		) {
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
		} catch (e: any) {
			if (("" + e).includes("No email found")) {
				if (await env.KV.get("failedOnce")) {
					await notify(env, "Mail check run failed: " + e);
					await env.KV.delete("failedOnce");
				} else {
					console.log("Mail check run failed: " + e);
					await env.KV.put("failedOnce", "");
				}
				return;
			}

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

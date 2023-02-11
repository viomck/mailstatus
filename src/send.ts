import { Env } from ".";
import { getAccountUri } from "./account";
import zfetch from "./zfetch";

export default async function send(env: Env) {
    const testId = new Date().getTime();

    for (const email of env.TO_EMAILS.split(",")) {
        const resp = await zfetch(
            env, 
            `${await getAccountUri(env)}/messages`,
            {
                body: JSON.stringify({
                    fromAddress: env.FROM_EMAIL,
                    toAddress: email,
                    subject: `mailTest_${testId}_${email}`,
                    content: "This is a test email."
                }),
                method: "POST"
            }
        );

        console.log(await resp.text());

        await env.KV.put("testId", testId + "");
    }
}
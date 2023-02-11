import { Env } from ".";
import { getAccountUri } from "./account";
import zfetch from "./zfetch";

export default async function receive(env: Env, testId: string) {
    const prefix = `mailTest_${testId}_`;

    const resp = await zfetch(
        env,
        `${await getAccountUri(env)}/messages/search?searchKey=` +
            encodeURIComponent(`subject:"${prefix}"`),
    );

    const json: { data: { subject: string }[] } = await resp.json();
    const subjects = json.data.map(x => x.subject.trim());

    for (const email of env.TO_EMAILS.split(",")) {
        if (!subjects.includes(prefix + email)) {
            throw new Error("No email found for " + email);
        }
    }

    console.log("=== MAIL CHECK GOOD! :D ===");
    await env.KV.delete("testId");
}

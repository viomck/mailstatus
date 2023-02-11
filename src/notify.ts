import { Env } from ".";

export default async function notify(env: Env, message: string) {
    console.log(message);

    const resp = await fetch(
        env.IFTTT_URL,
        {
            method: "POST",
            headers: {
                "content-type": "application/json"
            },
            // this api is hilarious
            body: JSON.stringify({
                value1: message,
            })
        }
    );

    console.log(await resp.text());

    if (!resp.ok) {
        console.error("FAILED TO SEND TO IFTTT: " + await resp.text());
    }
}

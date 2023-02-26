import { Env } from ".";

type WuphfFetch = (
    url: string, 
    req: RequestInit<{ skipAuth: boolean }>,
) => Promise<Response>;

export default async function notify(env: Env, message: string) {
    const resp = await (env.WUPHF.fetch as WuphfFetch)(
        "https://dummy",
        {
            cf: {
                skipAuth: true,
            },
            body: JSON.stringify({
                subject: "mailstatus failure",
                from: "mailstatus",
                message
            }),
            method: "POST"
        }
    );
    console.log(await resp.text());
}

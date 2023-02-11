import { Env } from ".";

export default async function zfetch(
    env: Env, 
    url: string, 
    init?: RequestInit<RequestInitCfProperties>
): Promise<Response> {
    if (!init) init = {};
    if (!init.headers) init.headers = {};

    init.headers = { 
        ...init.headers, 
        authorization: "Zoho-oauthtoken " + await env.KV.get("accessToken"),
        "content-type": "application/json",
    };

    const resp = await fetch(url, init);

    if (!resp.ok) {
        throw new Error(await resp.text());
    }

    return resp;
}

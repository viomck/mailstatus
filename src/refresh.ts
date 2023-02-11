import { Env } from ".";

export default async function refresh(env: Env) {
    let [refreshToken, redirectUriEncoded, scopesEncoded] = await Promise.all([
        env.KV.get("refreshToken"),
        env.KV.get("redirectUriEncoded"),
        env.KV.get("scopesEncoded"),
    ]);

    const resp = await fetch(
        "https://accounts.zoho.com/oauth/v2/token" +
            "?refresh_token=" + refreshToken +
            "&grant_type=refresh_token" +
            "&client_id=" + env.CLIENT_ID +
            "&client_secret=" + env.CLIENT_SECRET +
            "&redirect_uri=" + redirectUriEncoded +
            "&scope=" + scopesEncoded,
        {
            method: "POST"
        }
    );

    if (!resp.ok) {
        throw new Error(await resp.text());
    }

    const json: any = await resp.json();

    console.log(json);

    await Promise.all([
        env.KV.put("accessToken", json.access_token),
        env.KV.put("expiresAt", "" + (new Date().getTime() + json.expires_in))
    ]);
}
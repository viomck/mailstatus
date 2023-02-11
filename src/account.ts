import { Env } from ".";
import zfetch from "./zfetch";

export async function getAccountUri(env: Env) {
    const idResp = await zfetch(env, "http://mail.zoho.com/api/accounts");
    const idJson: { data: { URI: string }[] } = await idResp.json();
    return idJson.data[0].URI;
}

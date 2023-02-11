#!/usr/bin/env zx

import { URLSearchParams } from "url";
import "zx/globals"

const express = require("express");
const crypto = require("crypto");
const app = express();

const config = YAML.parse(fs.readFileSync("config.yml").toString());

const oauthScopes = [
    "ZohoMail.messages.READ",
    "ZohoMail.messages.CREATE",
    "ZohoMail.folders.READ",
    "ZohoMail.accounts.READ",
]

const state = crypto.randomBytes(32).toString("hex");

const redirectUriEncoded = encodeURIComponent("http://localhost:5417");
const scopesEncoded = encodeURIComponent(oauthScopes.join(" "));

const authUrl = "https://accounts.zoho.com/oauth/v2/auth" + 
    "?scope=" + scopesEncoded + 
    "&client_id=" + config.zoho.clientId + 
    "&response_type=code" + 
    "&access_type=offline" + 
    "&redirect_uri=" + redirectUriEncoded +
    "&state=" + state +
    "&prompt=consent";

echo("");
echo("");
echo(chalk.yellow("Please open the below URL in your browser:"));
echo("");
echo(chalk.white(authUrl));
echo("");
echo("");

app.get("/", async (req, res) => {
    const query = new URLSearchParams(req.url.split("?")[1]);

    // lol
    const code = query.get("code");
    const theirState = query.get("state");

    if (theirState !== state) {
        res.status(400).send("Bad state. Try again.");
        process.exit(1);
    }

    const tokenResp = await fetch(
        "https://accounts.zoho.com/oauth/v2/token" +
            "?code=" + code +
            "&grant_type=authorization_code" +
            "&client_id=" + config.zoho.clientId +
            "&client_secret=" + config.zoho.clientSecret +
            "&redirect_uri=" + redirectUriEncoded +
            "&scope=" + scopesEncoded,
        {
            method: "POST"
        }
    );

    if (!tokenResp.ok) {
        res.status(403).send("Zoho error: " + await tokenResp.text());
        process.exit(1);
    }

    const tokenJson = await tokenResp.json();

    let envName = "";

    if (argv.e) envName = argv.e;
    else if (argv.env) envName = argv.env;
    else if (argv.environment) envName = argv.environment;

    for (const [key, value] of [
        ["accessToken", tokenJson.access_token],
        ["refreshToken", tokenJson.refresh_token],
        ["expiresAt", new Date().getTime() + tokenJson.expires_in],
        ["redirectUriEncoded", redirectUriEncoded],
        ["scopesEncoded", scopesEncoded],
    ]) {
        let flags = "";
        if (argv.p || argv.preview) flags = "--preview";
        else flags = "--preview=false";
        if (envName) flags += " -e " + envName;

        await $`wrangler kv:key put ${key} ${value} --binding KV ${flags}`;
    }

    res.send(
        "All good!  Feel free to close your browser.  Make sure to deploy soon"
    );
    
    process.exit(0);
});

app.listen(5417);

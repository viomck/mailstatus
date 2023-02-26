#!/usr/bin/env zx

import "zx/globals"

const config = YAML.parse(fs.readFileSync("config.yml").toString());

let command = "dev";

if (argv._.length > 1) command = argv._[1];

const args = [
    "--var", "FROM_EMAIL:" + config.fromEmail,
    "--var", "TO_EMAILS:" + config.toEmails.join(","),
    "--var", "CLIENT_ID:" + config.zoho.clientId,
    "--var", "CLIENT_SECRET:" + config.zoho.clientSecret,
];

if (command === "dev") {
    args.push("--var", "ENVIRONMENT:dev");
}

await $`wrangler ${command} ${args} ${argv._.splice(2)}`

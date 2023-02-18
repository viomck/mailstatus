[webhook integration]: (https://ifttt.com/maker_webhooks)
[cfids]: (https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/find-account-and-zone-ids/)
[cf-make-kv]: (https://github.com/viomck/bin/blob/main/cf-make-kv.mjs)

# mailstatus

a zoho-specific mail forwarding test suite. this is a very niche application,
but i figured i'd open source it anyway. this is used for domains that are
not @viomck.com that forward to @viomck.com emails.

## why

cloudflare has historically had some weird routing issues with zoho. they seem
now to be resolved, so i moved from my old solution to sending directly to
zoho. email is important and i don't want to take any risks, so this checks
the forwarding every 10 minutes.

## prerequisites

- a zoho test user account
- an email route on all applicable domains to that account
- an IFTTT applet with a [Webhook Integration]
- the URL to the webhook
- npm packages wrangler and zx (`npm i -g wrangler zx`)
- a unix environment (CLI **may** work on windows, but is not supported)
- a [zoho oauth2 client](https://api-console.zoho.com/)
- a decently recent version of npm/node

## setup

1. clone the repo and cd into it
1. install all dependencies with `npm i`
1. create a kv with `wrangler kv:namespace create KV` (or [cf-make-kv])
1. copy the binding configuration and replace the existing one in wrangler.toml
1. change the account_id in wrangler.toml to [yours][cfids]
1. copy config.example.yml to config.yml and edit the variables
1. run `./scripts/login.mjs` and follow the instructions in a browser that is
   logged into your new test account
1. run `./scripts/run.mjs publish` to publish the script
1. _(optional)_ monitor the inbox for the next hour or so to make sure all
   works well

## testing

if you wish to test your worker in production, you can send the `Authorization`
header, with the value set to your zoho client secret. i recommend using
`wrangler tail` to follow the logs of the worker while this happens.

you can send requests to the following endpoints:

- https://yourworker.example/ - run the test process
  - NOTE: This only does one half of the process, sending the mail, or making
    sure it arrived
  - Run it twice (with time in between for mail to send) to get the full
    result
- https://yourworker.example/notify - send a test notification to IFTTT
- https://yourworker.example/refresh - prematurely refresh your zoho oauth2

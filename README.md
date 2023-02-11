# mailstatus

a zoho-specific mail forwarding test suite. this is a very niche application,
but i figured i'd open source it anyway. this is used for domains that are
not @viomck.com that forward to @viomck.com emails.

## why

cloudflare has historically had some weird routing issues with zoho. they seem
now to be resolved, so i moved from my old solution to sending directly to
zoho. email is important and i don't want to take any risks, so this checks
the forwarding every 10 minutes.

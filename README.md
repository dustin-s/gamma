# gamma

## Setup for local:

There are 2 .env files that will need the proper values added to them. One is in the root folder, this holds the Google API key. The other is in the server folder, this holds the database configuration values and the JWT secret. Contact Chip to get the proper values if needed.

## HTTPS

The server is using a self-signed certificate. This will need to be created locally with the key bing gamma. To do this use this command:
`openssl req -nodes -new -x509 -keyout gamma.key -out gamma.cert`
when prompted, accept the defaults except:

- `Common name = gamma.com`
- `Email Address = ` < your email >

This will be fixed when we move it to production.

# G.A.M.M.A. - Gold Award Map Making App

## Setting Up Testing Environment

### Setup for local:

There are 2 .env files that will need the proper values added to them. One is in the root folder, this holds the Google API key. The other is in the server folder, this holds the database configuration values and the JWT secret. Contact Chip to get the proper values if needed.

### HTTPS

The server is using a self-signed certificate. This will need to be created locally with the key bing gamma. To do this use this command:
`openssl req -nodes -new -x509 -keyout gamma.key -out gamma.cert`
when prompted, accept the defaults except:

- `Common name = gamma.com`
- `Email Address = ` < your email >

This will be fixed when we move it to production.

## Understanding the Code Structure

### The Client Application

This is a [react native application](https://reactnative.dev/). blah blah blah

#### Admin Screen
#### Point of Interest Screen

This is the screen for adding a point of interest to a trail.
If the trail already exists, it gets uploaded immediately, if the trail doesn't exist,
it gets uploaded in the `client/app/components/SaveTrailModal.tsx`.

- Main controller code for the manipulating points of interest. `client/app/screens/PointOfInterest.tsx`
- client/app/interfaces/POIObj.ts
- client/app/contexts/TrailContext/poiReducer.ts
- client/app/components/POIMarker.tsx
- client/app/components/AdminButtons/index.tsx

#### Trail Screen
#### Update Password Screen
### The Server Application

_Describe server side application._

#### Admin Screen

_Describe server side components_

#### Point of Interest Screen
#### Trail Screen
#### Update Password Screen
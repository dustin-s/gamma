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


#### Admin Login Screen

This is the screen for administraters to login to edit the map.
The only way to make an account is on the server through [Insomnia](https://insomnia.rest/). 

- Controler code to handle signing in. `client\app\screens\AdminLogin.tsx`
- Loging in changes state of auth user status in `client\app\contexts\authContext.tsx` which controls user accessibility for screens.
- _See Update Password Screen details for information about `client\app\interfaces\User.ts`._

#### Point of Interest Screen

This is the screen for adding a point of interest to a trail.
If the trail already exists, it gets uploaded immediately, if the trail doesn't exist,
it gets uploaded in the `client/app/components/SaveTrailModal.tsx`.

- Main controller code for the manipulating points of interest. `client/app/screens/PointOfInterest.tsx`
- Turns the POI into an object. `client/app/interfaces/POIObj.ts`
- client/app/contexts/TrailContext/poiReducer.ts
- Controller to create a new or update POIs while mapping trails. `client/app/components/AdminButtons/index.tsx`
- Controler for camera. `client\app\components\ShowCamera.tsx`
- Returns the POI data as a touchable marker on the trail. `client/app/components/POIMarker.tsx`
- _See Admin Login Screen details for information about `client\app\contexts\authContext.tsx`._

#### Trail Screen

This is the main screen of the app. 

- This is the main controller that renders everything for the trails. `client\app\screens\TrailScreen.tsx`

- client\app\interfaces\TrailCoords.ts
- client\app\interfaces\TrailData.ts
- client\app\interfaces\SaveTrailData.ts

- Destructures the context so that the values can be used directly. `client\app\hooks\useTrailContext.ts`
- Controls trail actions. `client\app\contexts\TrailContext\actions.ts`
- client\app\contexts\TrailContext\index.tsx
- client\app\contexts\TrailContext\locationReducer.ts
- client\app\contexts\TrailContext\poiReducer.ts
- client\app\contexts\TrailContext\trailIdReducer.ts
- client\app\contexts\TrailContext\trailListReducer.ts

- To set trail details before saving trails. `client\app\components\SaveTrailModal.tsx`
- client\app\components\ShowTrails.tsx
- client\app\components\TrailHeadMarker.tsx
- client\app\components\TrailStatusMarkers\index.tsx
- Properties and style of the button that navigates to the login or update password/signout screen. `client\app\components\LoginButton`
- _See Point of Interest Screen details for information about`client\app\components\POIMarker.tsx`._

#### Update Password Screen

This screen is for changing administrators passwords and signing out.
This screen appears only when you are logged in.

- Controler code to handle updating passwords and signing out. `client\app\screens\UpdatePassword.tsx`
- Comunicates with the server for admin user info to varify or update it. `client\app\interfaces\User.ts`
- _See Admin Login Screen details for information about `client\app\contexts\authContext.tsx`._

### The Server Application

_Describe server and database side of GAMMA application._

#### Admin Screen

_Describe server side components_

#### Point of Interest Screen
#### Trail Screen
#### Update Password Screen
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

This is a [react native application](https://reactnative.dev/). The purpose of which is to have self-guided nature hikes and an easily updatable map.

#### Admin Login Screen

This is the screen for administraters to login to edit the map. Admin accounts are made directly in the database.

- Controler code to handle signing in. `client\app\screens\AdminLogin.tsx`
- Data store for auth user status; controls user accessibility for screens `client\app\contexts\authContext.tsx` 
- _See Update Password Screen details for information about `client\app\interfaces\User.ts`._

#### Point of Interest Screen

This is the screen for adding a point of interest (POI) to a trail.
If the trail already exists, it gets uploaded immediately, if the trail doesn't exist,
it gets uploaded in the `client/app/components/SaveTrailModal.tsx`.

- Main controller code for the manipulating points of interest. `client/app/screens/PointOfInterest.tsx`
- Turns the POI into an object. `client/app/interfaces/POIObj.ts`
- Data store for POI. `client/app/contexts/TrailContext/poiReducer.ts`
- Controller to create a new or update POIs while mapping trails. `client/app/components/AdminButtons/index.tsx`
- Controller for camera on a mobile device. `client\app\components\ShowCamera.tsx`
- Returns the POI data as a touchable marker on the trail. `client/app/components/POIMarker.tsx`
- _See Admin Login Screen details for information about `client\app\contexts\authContext.tsx`._

#### Trail Screen

This is the main screen of the app enabling users to explore the map and trails. 
There are admin dependancies for edditing the map  _*See Admin Login Screen `client\app\contexts\authContext.tsx` details for more information._

- This is the primary controller that renders everything for the trails. `client\app\screens\TrailScreen.tsx`
- This holds the defult coordinates of the app. `client\app\utils\constants.ts`
- Calculates trail length. `client\app\utils\distance.ts`
- Function for getting trail coordinates and colors. `client\app\utils\mapFunctions.ts`
- Controller for foreground permissions. `client\app\utils\permissionHelpers.ts`
- Returns correct value depending on the information being passed through. `typeclient\app\utils\typeGuard.ts`
- Promise for save trail data. `client\app\interfaces\SaveTrailData.ts`
- Promise for trail coordinences. `client\app\interfaces\TrailCoords.ts`
- Promise for trail data. `client\app\interfaces\TrailData.ts`
- Destructures the context so that the values can be used directly. `client\app\hooks\useTrailContext.ts`
- Declairs actions for data stores. `client\app\contexts\TrailContext\actions.ts`
- Main data store for trail functions. `client\app\contexts\TrailContext\index.tsx`
- Data store for locations. `client\app\contexts\TrailContext\locationReducer.ts`
- _See Point of Interest Screen details for information about `client\app\contexts\TrailContext\poiReducer.ts`_
- Data store for trail IDs. `client\app\contexts\TrailContext\trailIdReducer.ts`
- Data store for trail lists. `client\app\contexts\TrailContext\trailListReducer.ts`
- To set trail details before saving trails. `client\app\components\SaveTrailModal.tsx`
 _*See Point of Interest Screen details for more information._
- Renders trails. `client\app\components\ShowTrails.tsx`
- Properties and styling for trailhead marker. `client\app\components\TrailHeadMarker.tsx`
- Properties and styling for cones, flowers, and distance bubbles. `client\app\components\TrailStatusMarkers\index.tsx`
- Properties and style for the navigation button to the Login and Update Password Screen. `client\app\components\LoginButton`
- _See Point of Interest Screen details for information about`client\app\components\POIMarker.tsx`._

#### Update Password Screen

This screen is for changing administrator(s) passwords and signing out.
This screen appears only when you are logged in.

- Controller code to handle updating passwords and signing out. `client\app\screens\UpdatePassword.tsx`
- Promise for user data. `client\app\interfaces\User.ts`
- _See Admin Login Screen details for information about `client\app\contexts\authContext.tsx`._

### The Server Application
The server side application is node.js app built on sequelize and express.

#### Trail API Routes

`GET /trails/`
- Get the Current Trails

`POST /trails/`
- Create New Trail

`POST /trails/updateTrail`
- Update a Trail

`DELETE /trails/:trailId`
- Delete an Existing Trail

`POST /trails/addPOI`
- Create a new POI

`POST /trails/updatePOI`
- Update a POI

#### User API Routes

`POST /users/signup`
- Create a New User

`POST /users/login`
- Login a New User

`POST /users/update`
- Update an Existing User
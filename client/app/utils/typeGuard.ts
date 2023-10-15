import { TrailData } from "../interfaces/TrailData";

const STRING_FIELDS = [
  "name",
  "description",
  "difficulty",
  "pointsOfInterestId",
  "image",
  "userName",
  "email",
  "token",
  "message",
];
const NUMBER_FIELDS = [
  "id",
  "trailId",
  "userId",
  "createdBy",
  "updatedBy",
  "distance",
  "latitude",
  "longitude",
  "altitude",
  "accuracy",
  "altitudeAccuracy",
  "heading",
  "speed",
  "pointsOfInterestId",
];
const BOOLEAN_FIELDS = ["isClosed", "isActive", "isAdmin", "requestPwdReset"];
const DATE_FIELDS = ["createdAt", "updatedAt", "lastPwdUpdate", "lastLogin"];
const ARRAY_FIELDS = ["TrailCoords", "PointsOfInterests"];
const OBJECT_FIELDS = ["user"];

interface genericObj {
  [key: string]: any;
}

// determines if the information being passed is an array or an object and then calls the correct function to returns the correct value type.
export const guardDataType = <T = unknown>(data: any) => {
  if (!data) {
    return data;
  }

  if (Array.isArray(data)) {
    return guardArr(data);
  } else {
    return guardObj(data);
  }
};

const guardObj = <T = unknown>(data: any) => {
  const cleanObj: genericObj = {};

  for (const [key, value] of Object.entries(data)) {
    switch (true) {
      case NUMBER_FIELDS.includes(key):
        cleanObj[key] = Number(value);
        break;
      case DATE_FIELDS.includes(key):
        cleanObj[key] = Date.parse(value as string);
        break;
      case ARRAY_FIELDS.includes(key):
      case OBJECT_FIELDS.includes(key):
        cleanObj[key] = guardDataType(value);
        break;

      case STRING_FIELDS.includes(key):
      case BOOLEAN_FIELDS.includes(key):
      default:
        cleanObj[key] = value;
        break;
    }
  }

  return cleanObj as T;
};

const guardArr = <T = unknown>(data: any) => {
  const cleanArr = data.map((detail: any) => guardObj(detail));

  return cleanArr as T;
};

import {
  uploadAsync,
  FileSystemUploadOptions,
  FileSystemUploadType,
} from "expo-file-system";
import { guardDataType } from "./typeGuard";
import { BASE_API } from "./constants";
import { POIObj } from "../interfaces/POIObj";
import { TrailData } from "../interfaces/TrailData";

/**
 * Compares 2 objects and returns any values that have changed between the
 * objects as strings.
 *
 * @param newObj object to be compared, data from this object will be returned
 * @param oldObj object to be compared, checks to see if this data has changed
 * @returns an object where all values have been converted in to strings
 */
const difference = (
  newObj: Record<string, any>,
  oldObj: Record<string, any>
) => {
  let changedObjects: Record<string, string> = {};
  Object.keys(newObj).forEach((key: string) => {
    if (newObj[key] !== oldObj[key]) {
      changedObjects[key] = newObj[key].toString();
    }
  });
  if (Object.keys(changedObjects).length === 0) {
    throw Error("Nothing changed in");
  }
  return changedObjects;
};

/**
 * Transforms an object in to a FromData object. This is called recursively to
 * deal with child objects/arrays.
 *
 * @param data object that will be transformed to form data
 * @param parentKey (optional) a key that represents the name of the parent in
 *              an imbedded object
 * @returns a FromData object
 */
export const changeToFormData = async (
  data: Record<string, any>,
  parentKey?: string,
  fd?: FormData
) => {
  const formData = fd || new FormData();
  parentKey = parentKey || "";

  for (const key in data) {
    if (data[key] instanceof Array) {
      for (const value of data[key]) {
        changeToFormData(value, parentKey + key + "_", formData);
      }
    } else if (typeof data[key] === "object") {
      changeToFormData(data[key], parentKey + key + "_", formData);
    } else {
      formData.append(parentKey + key, data[key].toString());
    }
  }

  return formData;
};

/**
 * Adds a point of interest to the database.
 *
 * @param newPOI data on the POI to be added. It must contain a *trailId* and
 *              *pointsOfInterestId* must be null or missing.
 * @param token the token from the authentication.
 * @returns the POI object that was successfully uploaded
 */
export const addPOIToTrail = async (newPOI: POIObj, token: string) => {
  console.log("*** Add POI to Trail function ***");

  const newData: Record<string, string> = {};
  Object.entries(newPOI).forEach(([key, value]) => {
    if (value) {
      newData[key] = value.toString();
    }
  });

  console.log("newData:", newData);

  return imageUpload(newData, token, "trails/addPOI/");
};

/**
 * Updates a point of interest to the database.
 *
 * @param newPOI data on the POI to be added. It must contain a *pointsOfInterestId*.
 * @param oldPOI the original POI that is being updated
 * @param token the token from the authentication.
 * @returns the POI object that was successfully uploaded
 */
export const updatePOI = async (
  newPOI: POIObj,
  oldPOI: POIObj,
  token: string
) => {
  console.log("*** Update POI function ***");
  if (!newPOI.pointsOfInterestId) {
    throw Error("missing newPOI.pointsOfInterestId when it is expected");
  }

  console.log("*** Get changedData ***");
  try {
    const changedData = await difference(newPOI, oldPOI);
    changedData["pointsOfInterestId"] = newPOI.pointsOfInterestId.toString();

    console.log("changedData:", JSON.stringify(changedData, null, 2));

    if (changedData.image) {
      console.log("do image upload");
      return imageUpload(changedData, token, "trails/updatePOI/");
    } else {
      console.log("do regular upload");
      return noImageUpload(changedData, token, "trails/updatePOI/");
    }
  } catch (e: any) {
    throw Error(e);
  }
};

/**
 * Does the actual upload to the database if there is no image as part of the
 * data.
 *
 * @param data this is an object that contains the data that is going to be submitted to the database.
 * @param token authorization token of a signed in user.
 * @param url API url of the database to be submitted (the BASE_API will be added to this).
 * @returns the POI object that was successfully uploaded
 */
const noImageUpload = async (
  data: Record<string, string>,
  token: string,
  url: string
) => {
  // console.log("*** noImageUpload ***");

  try {
    const formData = await changeToFormData(data);

    const options: RequestInit = {
      method: "POST",
      headers: {
        Accept: "multipart/form-data",
        "Cache-control": "no-cache",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };

    const response = await fetch(BASE_API + url, options);

    const responseData = await response.json();
    if (responseData.error) {
      throw Error(responseData.error);
    }
    // we only need to check if there is an error - we will refetch data in main object.
    return responseData as POIObj;
  } catch (error: any) {
    throw Error(error);
  }
};

/**
 * Does the actual upload to the database if there *is* an image as part of the
 * data.
 *
 * *Only 1 image can be uploaded at a time:!*
 *
 * @param data this is an object that contains the data that is going to be submitted to the database.
 * @param token authorization token of a signed in user.
 * @param url API url of the database to be submitted (the BASE_API will be added to this).
 * @returns the POI object that was successfully uploaded
 */
const imageUpload = async (
  data: Record<string, string>,
  token: string,
  url: string
) => {
  // console.log("*** imageUpload ***");

  const { image } = data;

  if (!image) {
    throw Error("missing image to upload");
  }
  delete data.image;

  const options: FileSystemUploadOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    httpMethod: "POST",
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: "image",
    parameters: data,
  };

  try {
    const response = await uploadAsync(BASE_API + url, image, options);

    // console.log(
    //   `status: ${response.status}\nheader:\n${JSON.stringify(
    //     response.headers,
    //     null,
    //     2
    //   )}\nbody:\n${response.body}`
    // );

    const data = JSON.parse(response.body);
    if (data.error) {
      throw Error(data.error);
    } else {
      return data as POIObj;
    }
  } catch (err: any) {
    console.log(err);
    throw Error(err.message);
  }
};

/**
 * gets all of the trails
 *
 * @returns a promise with either data.error as an error message or a clean list of trails (it does not update the trailContext)
 */
//  (https://stackoverflow.com/questions/41103360/how-to-use-fetch-in-typescript)
export const getTrails = async <T>(): Promise<T> => {
  return fetch(BASE_API + "trails")
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error);
      }
      const cleanData = guardDataType<TrailData[]>(data);
      return cleanData as T;
    });
};

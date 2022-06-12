import { POIObj } from "../interfaces/POIObj";
import { BASE_API } from "./constants";
import * as FileSystem from "expo-file-system";
import {
  FileSystemUploadOptions,
  FileSystemUploadType,
} from "expo-file-system";

const stringify = async (obj: object) => JSON.stringify(obj, null, 2);

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

export const changeToFormData = async (
  data: Record<string, any>,
  parentKey?: string
) => {
  // console.log("changeToFormData: Entry data:", stringify(data));
  const formData = new FormData();
  parentKey = parentKey || "";

  Object.keys(data).forEach((key: string) => {
    if (typeof data[key] === "object") {
      changeToFormData(data[key], parentKey + key + "_");
    }
    formData.append(parentKey + key, data[key]);
  });

  return formData;
};

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

const noImageUpload = async (
  changedData: Record<string, string>,
  token: string,
  url: string
) => {
  console.log("*** noImageUpload ***");

  try {
    const formData = await changeToFormData(changedData);

    const options: RequestInit = {
      method: "POST",
      headers: {
        Accept: "multipart/form-data",
        "Cache-control": "no-cache",
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    };
    console.log(stringify(options));

    const response = await fetch(BASE_API + url, options);

    const data = await response.json();
    if (data.error) {
      throw Error(data.error);
    }
    console.log(data);
    // we only need to check if there is an error - we will refetch data in main object.
  } catch (error: any) {
    throw Error(error);
  }
};

const imageUpload = async (
  changedData: Record<string, string>,
  token: string,
  url: string
) => {
  console.log("initial changedData:", JSON.stringify(changedData, null, 2));

  console.log("***** get other fields section *****");
  const { image } = changedData;

  if (!image) {
    throw Error("missing image to upload");
  }
  console.log("image:", image);
  delete changedData.image;

  console.log("changedData:", JSON.stringify(changedData, null, 2));

  console.log("***** Options section *****");
  const options: FileSystemUploadOptions = {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "image/jpeg, image/png",
      Authorization: `Bearer ${token}`,
    },
    httpMethod: "POST",
    uploadType: FileSystemUploadType.MULTIPART,
    fieldName: "image",
    parameters: changedData,
  };
  console.log("***** 'Fetch' section *****");
  console.log("URL:", BASE_API + url);
  try {
    const response = await FileSystem.uploadAsync(
      BASE_API + url,
      image,
      options
    );

    console.log(
      `status: ${response.status}\nheader:\n${JSON.stringify(
        response.headers,
        null,
        2
      )}\nbody:\n${response.body}`
    );

    if (response.status >= 200 && response.status < 300) {
      return;
    } else {
      throw Error(response.body);
    }
  } catch (err: any) {
    console.log(err);
    throw Error(err.message);
  }
};

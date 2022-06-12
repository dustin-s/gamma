import { POIObj } from "../interfaces/POIObj";
import { Authentication } from "./authContext";
import { BASE_API } from "./constants";

// this little gem is from: https://github.com/expo/examples/blob/master/with-aws-storage-upload/App.js
export const fetchImageFromUri = async (uri: string) => {
  console.log("*** Start Fetch Image From Uri ***\n");

  // uri =
  //   "https://file-examples.com/storage/feb8f98f1d627c0dc94b8cf/2017/10/file_example_JPG_100kB.jpg";
  const response = await fetch(uri);
  // console.log("response:");
  // console.log(response);

  const blob = await response.blob();
  console.log("uri:", uri);
  console.log("blob (on next line):");
  console.log(JSON.stringify(blob));
  console.log("Blob.prototype.size:", blob.size, "(bytes)");
  console.log("Blob.prototype.type:", blob.type);

  console.log("\n*** End Fetch Image From Uri ***");
  return blob;
};

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
    const changedData = difference(newPOI, oldPOI);
    changedData["pointsOfInterestId"] = newPOI.pointsOfInterestId.toString();

    console.log("formData:");
    console.log(JSON.stringify(changedData, null, 2));

    if (changedData.image) {
      console.log("do image upload");
    } else {
      console.log("do regular upload");
      return noImageUpload(changedData, token);
    }
  } catch (e: any) {
    throw Error(e);
  }
};

const noImageUpload = async (
  changedData: Record<string, string>,
  token: string
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
    console.log(JSON.stringify(options, null, 2));

    const response = await fetch(BASE_API + "trails/updatePOI/", options);

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

export const changeToFormData = async (
  data: Record<string, any>,
  parentKey?: string
) => {
  const formData = new FormData();
  Object.keys(data).forEach((key: string) => {
    if (typeof data[key] === "object") {
      changeToFormData(data[key], parentKey + key + "_");
    }
    formData.append(parentKey + key, data[key]);
  });

  return formData;
};

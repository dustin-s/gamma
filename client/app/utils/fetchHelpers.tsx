// this little gem is from: https://github.com/expo/examples/blob/master/with-aws-storage-upload/App.js
export const fetchImageFromUri = async (uri: string) => {
  console.log("***** Start Fetch Image From Uri *****\n");

  // uri =
  //   "https://file-examples.com/storage/feb8f98f1d627c0dc94b8cf/2017/10/file_example_JPG_100kB.jpg";
  const response = await fetch(uri);
  // console.log("response:");
  // console.log(response);

  const blob = await response.blob();
  console.log("uri:", uri);
  console.log("blob (on next line):");
  console.log(blob);
  console.log("Blob.prototype.size:", blob.size, "(bytes)");
  console.log("Blob.prototype.type:", blob.type);

  console.log("\n***** End Fetch Image From Uri *****");
  return blob;
};

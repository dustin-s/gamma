// this little gem is from: https://github.com/expo/examples/blob/master/with-aws-storage-upload/App.js
export const fetchImageFromUri = async (uri: string) => {
  // console.log("***** Fetch Image From Uri *****");

  const response = await fetch(uri);
  // console.log("response:");
  // console.log(response);

  const blob = await response.blob();
  // console.log("Blob.prototype.size:", blob.size);
  // console.log("Blob.prototype.type:", blob.type);

  return blob;
};

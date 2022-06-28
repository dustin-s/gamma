const BASE_API = "https://gamma.lessthangeeky.com/api/";

const btnTrails = document.querySelector("#trails");

btnTrails.addEventListener("click", showTrails);

function showTrails() {
  console.log("\nShow Trails:\n\n");
  const requestUrl = BASE_API + "trails";

  fetch(requestUrl)
    .then((response) => {
      console.log("response:\n", response);
      return response.json();
    })
    .then((data) => {
      console.log(data);
    })
    .catch((e) => {
      console.log("fetch catch:]n", e);
    });
}

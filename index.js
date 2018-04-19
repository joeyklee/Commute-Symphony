// require the fs to access filesystem using node
const fs = require('fs')
const geocoder = require('mapbox-geocoding');
const config = require('./config')
//to declare the file
let data = JSON.parse(fs.readFileSync("LocationHistory.json"))
// set your access token - get your own at mapbox.com
geocoder.setAccessToken(pk.eyJ1IjoibWlraWJpbnh1ZSIsImEiOiJjamc2bXZ1eDkyM2doMzN4ZnF3d2ViaXZhIn0.uLbHsp3WHkiYK8cyWPTDhg);
//config.mapbox_access_token
/*
this is your data
probably you read it in using
fs.readFileSync() ...
*/
let ori_history = data.locations;
let coordsList = [];

ori_history.forEach(function(obj){
	let place = new Object();
	place.lat = obj.latitudeE7/1000;
	place.lon = obj.longitudeE7/1000;
	place.placename = "";
  coordsList.push(place)
});


// let coordsList = [
// 	{lat:40.675377, lng:-73.960139},
// 	{lat:40.679723, lng:-73.984292},
// 	{lat:40.687587, lng:-73.959978}
//  ]

/*
 function parselocation(coordinate){
   var parsed_coordinate = coordinate/10000000;
   return parsed_coordinate;

 }

 // parse all the locations to lat long
 data.locations.map(function(location){
   location.latitudeE7 = parselocation(location.latitudeE7)
   location.longitudeE7 = parselocation(location.longitudeE7)
   return location
 })
*/

/*
@ getAddress
@@ params: takes lng and lat - NOTE THE ORDER
This is an async function that uses the: async/await pattern
What this does is await for the JS Promise to be completed
*/
async function getAddress( lng, lat){
	console.log('starting')
	let response = await new Promise( (resolve, reject) => {
		geocoder.reverseGeocode('mapbox.places',  lng, lat, (err, data) => {
			resolve(data);
		})
	})
	console.log('ending')
	return response
}

// getAddress( coordsList[0].lng, coordsList[0].lat).then(temp =>{
// 	console.log(JSON.stringify(temp));
// })


/*
@ getAllAddresses
@@ params: takes the coordinate list
this is another async/await pattern function
returns an array of js promises that we can access the data
with the .then() method
*/
async function getAllAddresses(coords){

	let promiseList = [];
	coords.forEach( coord => {
		promiseList.push(getAddress( coord.lng, coord.lat))
	})

	let addresses = await Promise.all(promiseList)

	return addresses

}

getAllAddresses(coordsList).then((data) => {

	/*
	now that we have the placename data for each feature
	store the data to the "filteredData" object
	e.g.
	*/
	coordsList.map( (feature, idx) => {
		feature.placename = data[idx]
		return feature
	})

	// do other data handling stuffs here if necessary
	// ...

	// when you're finished write te
	// write the data out to a file
	fs.writeFile("filtered-and-geocoded-locations.json", JSON.stringify(coordsList), function(err, data){
		console.log("complete!")
	})


})


	mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
container: 'map', // container ID
// Choose from Mapbox's core styles, or make your own style with Mapbox Studio
style: 'mapbox://styles/mapbox/light-v10', // style URL
center: campground.geometry.coordinates, // starting position [lng, lat]
zoom: 6 // starting zoom
});

map.addControl(new mapboxgl.NavigationControl() );

new mapboxgl.Marker()
.setLngLat(campground.geometry.coordinates)
.setPopup(
	new mapboxgl.Popup({offset: 25})
	.setHTML(`<h5>${campground.title}</h5><p>${campground.location}</p>` )

)
.addTo(map)
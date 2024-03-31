mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  // style: 'mapbox://styles/mapbox/dark-v11', // style URL or style object
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 11, // starting zoom
});

// Create a default Marker and add it to the map.
const marker = new mapboxgl.Marker({ color: 'red' })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new mapboxgl.Popup({ offset: 25 }).setHTML(
      `<h3>${listing.title}</h3><p>Exact location provided after booking</p>`
    )
  )
  .addTo(map);

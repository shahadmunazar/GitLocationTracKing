const socket = io();


// Track location
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        socket.emit("send-location", { latitude, longitude });
        const apiKey = 'aa93b0b13d55d12b3766aa1e71573d8b';
        const url = `http://api.positionstack.com/v1/reverse?access_key=${apiKey}&query=${latitude},${longitude}&output=json`;
  
        fetch(url)
          .then(response => response.json())
          .then(data => {
            console.log("📍 Full Address:", data);
  
            const address = data.data[0];
  
            const building = address.name || "N/A";
            const road = address.street || "N/A";
            const city = address.city || "N/A";
            const state = address.region || "N/A";
            const postcode = address.zip || "N/A";
            const country = address.country || "N/A";
  
            console.log("🏢 Building:", building);
            console.log("🛣️ Street:", road);
            console.log("🏙️ City:", city);
            console.log("🗺️ State:", state);
            console.log("📮 Postcode:", postcode);
            console.log("🌍 Country:", country);
  
            socket.emit("send-address-details", {
              building,
              road,
              city,
              state,
              postcode,
              country
            });
          })
          .catch(error => console.error("Reverse geocoding error:", error));
      },
      (error) => console.error("Geolocation error:", error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  } else {
    console.error("Geolocation is not supported by this browser.");
  }
  

const map = L.map("map").setView([0, 0], 16);
let marker;


L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "OpenStreetMap",
}).addTo(map);

const markers = {};

socket.on("received-location",(data) => {
    const {id,latitude,longitude} = data;
    map.setView([latitude, longitude]);
    if(markers[id]){
        markers[id].setLatLng([latitude,longitude])
    }else{
        markers[id] = L.marker([latitude,longitude]).addTo(map)
    }
})

socket.on("user-disconnected", (id)=>{
    if(markers[id]){
        map.removeLayer(markers[id])
        delete markers[id]
    }
})


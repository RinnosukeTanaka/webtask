import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet"; 
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png"; 
import markerIcon from "leaflet/dist/images/marker-icon.png"; 
import markerShadow from "leaflet/dist/images/marker-shadow.png"; 

delete L.Icon.Default.prototype._getIconUrl; L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow, });

const weatherBackgrounds = {
  Clear: "/images/clear.jpg", 
  Clouds: "/images/clouds.jpg", 
  Rain: "/images/rain.jpg",
  Snow: "/images/snow.jpg", 
  Drizzle: "/images/rain.jpg", 
  Thunderstorm: "/images/rain.jpg",
  Mist: "/images/clouds.jpg", 
  Fog: "/images/clouds.jpg", 
  Default: "/images/default.jpg", 
};

const styles = { 
  container: {
    padding: "20px",
    fontFamily: "sans-serif",
    background: "#f5f5f5",
    minHeight: "100vh",
  },
  title: {
    fontSize: "32px",
    fontWeight: "bold",
    color:"white",
    textAlign: "center",
    marginBottom: "20px",
  },
  button: {
    display: "block",
    margin: "0 auto",
    padding: "10px 20px",
    fontSize: "16px",
    borderRadius: "8px",
    border: "none",
    background: "#007bff", 
    color: "white",
    cursor: "pointer",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: "10px",
  }, 
  card: {
    marginTop: "30px",
    background: "rgba(255, 255, 255, 0.6)",
    backdropFilter: "blur(10px)",
    padding: "20px", 
    borderRadius: "15px", 
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)", 
    maxWidth: "400px", 
    marginLeft: "auto", 
    marginRight: "auto", 
  },
  section: { 
    marginBottom: "20px", 
  }, 
  sectionTitle: { 
    fontSize: "18px", 
    marginBottom: "10px", 
    borderBottom: "1px solid #ddd", 
    paddingBottom: "5px", 
  }, 
  iconWrapper: { 
    background: "#f0f0f0", 
    padding: "10px", 
    borderRadius: "12px", 
    display: "inline-block", 
  }, 
  icon: { 
    width: "80px", 
    height: "80px", 
  }, 
};

function App(){
  const [lat,setLat] = useState(null);
  const [lon, setLon] = useState(null);
  const [error, setError] = useState(null);
  const [weather, setWeather] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);

  const API_KEY = import.meta.env.VITE_API_KEY;

  useEffect(()=> {
    if(lat &&lon) {
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`)
        .then((res)=>res.json())
        .then((data)=>{
          setWeather(data);
        })
        .catch(()=>{
          setError("天気情報の取得に失敗しました");
        });
      
      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
        .then((res)=>res.json())
        .then((data)=>{
          setLocationInfo(data.address);
        })
        .catch(()=>{
          setError("住所情報の取得に失敗しました");
        });
    }
  },[lat, lon]);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("このブラウザは位置情報に対応していません");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLon(pos.coords.longitude); 
        setError(null);
      },
      () => { 
        setError("位置情報が取得できませんでした");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  return (
    <div 
      style={{
        ...styles.container,
        backgroundImage: weather 
          ? `url(${weatherBackgrounds[weather.weather[0].main] || weatherBackgrounds.Default})` 
          : "none", 
        backgroundSize: "cover", 
        backgroundPosition: "center", 
        backgroundRepeat: "no-repeat",
      }}
    >
      <h1 style={styles.title}>天気アプリ</h1>
      
      <button style={styles.button} onClick={getLocation}>現在地を取得</button>

      {lat && lon && (
        <p>
          緯度: {lat}, 経度: {lon} 
        </p>
      )} 

      {error && <p style={styles.error}>{error}</p>}
      
      {(weather || locationInfo) &&(
        <div style={styles.card}>
          {locationInfo &&(
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>現在地</h2>
              <p>国: {locationInfo.country}</p>
              <p>都道府県: {locationInfo.state}</p>
              <p>
                市区町村:{" "}
                {locationInfo.city ||
                  locationInfo.town ||
                  locationInfo.village ||
                  "不明"} 
              </p>
            </div>
          )}


          {weather &&(
            <div style={styles.section}>
              <h2 style={styles.sectionTitle}>天気</h2>
              <p>気温: {weather.main.temp}℃</p>
              <p>天気: {weather.weather[0].description}</p>
              <div style={styles.iconWrapper}>
                <img
                  src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
                  alt="weather icon"
                  style={styles.icon}
                />
              </div>
            </div>
         )}
        </div>
      )}

      {lat && lon && (
          <div style={{ marginTop: "20px" }}> 
            <MapContainer 
              center={[lat, lon]} 
              zoom={13} 
              style={{ height: "300px", width: "100%", borderRadius: "12px" }} 
            > 
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" /> 
              <Marker position={[lat, lon]} /> 
            </MapContainer> 
          </div> 
      )}
    </div>
  );
} 

export default App;
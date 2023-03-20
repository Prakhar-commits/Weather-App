const APIKEY = "31a6db7ce0091bfd0c77b3e1e3fa15a3";

const getcurrentweather = async()=>{
    const city = "DELHI"
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`)
    return response.json();
}

const getHourlyforecast = async() =>{
const city = "DELHI"
const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKEY}`)
const data = await response.json();
return data.list.map(forecast => {
    const { main: {temp , temp_max , temp_min } , dt , dt_txt , weather: {description , icon }} = forecast;
    return{ temp , temp_max , temp_min, dt , dt_txt , description , icon}
})

}

const formattedtemperature = (temp) => `${temp?.toFixed(1)}°`;
const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;


const loadCurrentforecast = ({name , main:{temp , temp_max , temp_min }, weather:[{description}]}) =>{
    const currentforecastelement = document.querySelector("#current-forecast");
    currentforecastelement.querySelector(".city").textContent = name;
    currentforecastelement.querySelector(".temp").textContent = formattedtemperature(temp);
    currentforecastelement.querySelector(".description").textContent = description;
    currentforecastelement.querySelector(".highlowtemp").textContent = `H : ${formattedtemperature(temp_max)} , L : ${formattedtemperature(temp_min)}`
} 


const loadHourlyforecast = (hourlyforecast) =>{
    console.log(hourlyforecast);
    let dataFor12hours = hourlyforecast.slice(1,13);
    const hourlyContainer = document.querySelector(".hourly-container");
    let innerHTMLString = ``;
    
    for(let { temp , icon , dt_txt} of dataFor12hours){
         innerHTMLString += `<article>
         <h2 class="time">${dt_txt.split(" ")[1]}</h2>
         <img class="icon" src="${iconUrl(icon)}"/>
         <p class="hourly-temp">${formattedtemperature(temp)}</p>
     </article>`
    }
    hourlyContainer.innerHTML = innerHTMLString; 
}

const loadFeelsLike = ({main: { feels_like }}) =>{
   const feelslikeelement =  document.querySelector("#feels-like");
   feelslikeelement.querySelector(".feels-liketemp").textContent = formattedtemperature(feels_like);
}

const loadHumidity = ({main: {humidity}})=>{
    const humidityelement = document.querySelector("#Humidity");
    humidityelement.querySelector(".Humidityvalue").textContent = `${humidity} %`;
}
document.addEventListener("DOMContentLoaded",  async()=>{
 const currentweather = await getcurrentweather();
 loadCurrentforecast(currentweather);
 const hourlyforecast = await getHourlyforecast(currentweather)
 loadHourlyforecast(hourlyforecast);
 loadFeelsLike(currentweather);
 loadHumidity(currentweather);
})
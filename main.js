const APIKEY = "31a6db7ce0091bfd0c77b3e1e3fa15a3";

const DAYS_OF_THE_WEEK = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const getcurrentweather = async()=>{
    const city = "DELHI"
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`)
    return response.json();
}

const getHourlyforecast = async() =>{
const city = "DELHI"
const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKEY}&units=metric`)
const data = await response.json();
return data.list.map(forecast => {
    const { main: {temp , temp_max , temp_min } , dt , dt_txt , weather:[ {description,icon}]} = forecast;
   
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

const calculateDayWiseForecast = (hourlyforecast)=>{
    let dayWiseForecast = new Map();
    for(let forecast of hourlyforecast){
        const [date]= forecast.dt_txt.split(" ");
        const dayofTheWeek = DAYS_OF_THE_WEEK(new date(date).getDay())

        if(dayWiseForecast.has(dayofTheWeek)){
            let forecastFortheDay = dayWiseForecast.get(dayofTheWeek);
            forecastFortheDay.push(forecast);
            dayWiseForecast.set(dayofTheWeek, forecastFortheDay);
        }else{
dayWiseForecast.set(dayofTheWeek,[forecast]);
        }
    }
    for(let[key,value] of dayWiseForecast){
        let mintemperatures = Math.min()
    }
}

const loadFiveDayForecast=()=>{
console.log(hourlyforecast)
const dayWiseForecast = calculateDayWiseForecast(hourlyforecast)
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
 loadFiveDayForecast(hourlyforecast);
 loadFeelsLike(currentweather);
 loadHumidity(currentweather);
})
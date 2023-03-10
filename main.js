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
const loadCurrentforecast = ({name , main:{temp , temp_max , temp_min }, weather:[{description}]}) =>{
    const currentforecastelement = document.querySelector("#current-forecast");
    currentforecastelement.querySelector(".city").textContent = name;
    currentforecastelement.querySelector(".temp").textContent = formattedtemperature(temp);
    currentforecastelement.querySelector(".description").textContent = description;
    currentforecastelement.querySelector(".highlowtemp").textContent = `H : ${formattedtemperature(temp_max)} , L : ${formattedtemperature(temp_min)}`
} 


const loadHourlyforecast = (hourlyforecast) =>{
    console.log(hourlyforecast);
}


document.addEventListener("DOMContentLoaded",  async()=>{
 const currentweather = await getcurrentweather();
 loadCurrentforecast(currentweather);
 const hourlyforecast = await getHourlyforecast(currentweather)
})
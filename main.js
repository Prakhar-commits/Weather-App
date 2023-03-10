const APIKEY = "31a6db7ce0091bfd0c77b3e1e3fa15a3";

const getcurrentweather = async()=>{
    const city = "DELHI"
    const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`)
    return response.json();
}

// const formattedtemperature = (temp) => `${temp?.tofixed(1)}°`;
const loadCurrentforecast = ({name , main:{temp , temp_max , temp_min }, weather:[{description}]}) =>{
    const currentforecastelement = document.querySelector("#current-forecast");
    currentforecastelement.querySelector(".city").textContent = name;
    currentforecastelement.querySelector(".temp").textContent = temp;
    currentforecastelement.querySelector(".description").textContent = description;
    currentforecastelement.querySelector(".highlowtemp").textContent = `H : ${temp_max} , L : ${temp_min}`
} 

document.addEventListener("DOMContentLoaded",  async()=>{
 const currentweather = await getcurrentweather();
 loadCurrentforecast(currentweather);
})
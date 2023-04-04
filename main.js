const APIKEY = "31a6db7ce0091bfd0c77b3e1e3fa15a3";

const DAYS_OF_THE_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

let selectedCityText;
let selectedCity;

const getCities = async (searchText) => {
  const response = await fetch(
    `http://api.openweathermap.org/geo/1.0/direct?q=${searchText}&limit=5&appid=${APIKEY}`
  );
  return response.json();
};

const getcurrentweather = async ({ lat, lon, name: city }) => {
  const url =
    lat && lon
      ? `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${APIKEY}&units=meteric`
      : `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIKEY}&units=metric`;
  const response = await fetch(url);
  return response.json();
};

const getHourlyforecast = async ({ name: city }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${APIKEY}&units=metric`
  );
  const data = await response.json();
  return data.list.map((forecast) => {
    const {
      main: { temp, temp_max, temp_min },
      dt,
      dt_txt,
      weather: [{ description, icon }],
    } = forecast;

    return { temp, temp_max, temp_min, dt, dt_txt, description, icon };
  });
};

const formattedtemperature = (temp) => `${temp?.toFixed(1)}°`;
const iconUrl = (icon) => `https://openweathermap.org/img/wn/${icon}@2x.png`;

const loadCurrentforecast = ({
  name,
  main: { temp, temp_max, temp_min },
  weather: [{ description }],
}) => {
  const currentforecastelement = document.querySelector("#current-forecast");
  currentforecastelement.querySelector(".city").textContent = name;
  currentforecastelement.querySelector(".temp").textContent =
    formattedtemperature(temp);
  currentforecastelement.querySelector(".description").textContent =
    description;
  currentforecastelement.querySelector(
    ".highlowtemp"
  ).textContent = `H : ${formattedtemperature(
    temp_max
  )} , L : ${formattedtemperature(temp_min)}`;
};

const calculateDayWiseForecast = (hourlyforecast) => {
  let dayWiseForecast = new Map();
  for (let forecast of hourlyforecast) {
    const [date] = forecast.dt_txt.split(" ");
    const dayofTheWeek = DAYS_OF_THE_WEEK[new Date(date).getDay()];

    if (dayWiseForecast.has(dayofTheWeek)) {
      let forecastFortheDay = dayWiseForecast.get(dayofTheWeek);
      forecastFortheDay.push(forecast);
      dayWiseForecast.set(dayofTheWeek, forecastFortheDay);
    } else {
      dayWiseForecast.set(dayofTheWeek, [forecast]);
    }
  }
  for (let [key, value] of dayWiseForecast) {
    let temp_min = Math.min(...Array.from(value, (val) => val.temp_min));
    let temp_max = Math.max(...Array.from(value, (val) => val.temp_max));
    dayWiseForecast.set(key, {
      temp_min,
      temp_max,
      icon: value.find((v) => v.icon).icon,
    });
  }
  return dayWiseForecast;
};

const loadFiveDayForecast = (hourlyforecast) => {
  const dayWiseForecast = calculateDayWiseForecast(hourlyforecast);
  const container = document.querySelector(".five-day-forecast-container");
  let dayWiseInfo = "";

  Array.from(dayWiseForecast).map(
    ([day, { temp_min, temp_max, icon }], index) => {
      if (index < 5) {
        dayWiseInfo += `<article class="day-wise-forecast">
    <h3 class="day">${index === 0 ? "Today" : day}</h3>
   <img class="icon" src="${iconUrl(icon)}" alt="forecast-icon">
    <p class="min-temp">${formattedtemperature(temp_min)}</p>
    <p class="max-temp">${formattedtemperature(temp_max)}</p>
</article>`;
      }
    }
  );

  container.innerHTML = dayWiseInfo;
};

const loadHourlyforecast = (
  { main: { temp: tempNow }, weather: [{ icon: iconNow }] },
  hourlyforecast
) => {
  console.log(hourlyforecast);
  const formattedTime = Intl.DateTimeFormat("en", {
    hour12: true,
    hour: "numeric",
  });
  let dataFor12hours = hourlyforecast.slice(2, 14);
  const hourlyContainer = document.querySelector(".hourly-container");
  let innerHTMLString = `<article>
  <h2 class="time">Now</h2>
  <img class="icon" src="${iconUrl(iconNow)}"/>
  <p class="hourly-temp">${formattedtemperature(tempNow)}</p>
</article>`;

  for (let { temp, icon, dt_txt } of dataFor12hours) {
    innerHTMLString += `<article>
         <h2 class="time">${formattedTime.format(new Date(dt_txt))}</h2>
         <img class="icon" src="${iconUrl(icon)}"/>
         <p class="hourly-temp">${formattedtemperature(temp)}</p>
     </article>`;
  }
  hourlyContainer.innerHTML = innerHTMLString;
};

const loadFeelsLike = ({ main: { feels_like } }) => {
  const feelslikeelement = document.querySelector("#feels-like");
  feelslikeelement.querySelector(".feels-liketemp").textContent =
    formattedtemperature(feels_like);
};

const loadHumidity = ({ main: { humidity } }) => {
  const humidityelement = document.querySelector("#Humidity");
  humidityelement.querySelector(".Humidityvalue").textContent = `${humidity} %`;
};

function debounce(func) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, 500);
  };
}

const geolocation = ()=>{
  navigator.geolocation.getCurrentPosition(({coords})=>{
    const {latitude:lat, longitude:lon} = coords;
    selectedCity = {lat ,lon};
    loadData();
  },error =>console.error(error))
}

const handleCitySelection = (event) => {
  selectedCityText = event.target.value;
  let options = document.querySelectorAll("#cities > option");
  if (options?.length) {
    let selectedOption = Array.from(options).find(
      (opt) => opt.value === selectedCityText
    );
    selectedCity = JSON.parse(selectedOption.getAttribute("data-city-details"));
    loadData();
  }
};

const onSearchChange = async(event) => {
  let { value } = event.target;
  if (!value) {
    selectedCity = null;
    selectedCityText = "";
  }
  if (value && (selectedCityText !== value)) {
    const listOfCities = await getCities(value);
    let options = "";
    for (let { lat, lon, name, state, country } of listOfCities) {
      options += `<option data-city-details='${JSON.stringify({
        lat,
        lon,
        name,
      })}' value="${name},${state},${country}"></option>`;
    }
    document.querySelector("#cities").innerHTML = options;
  }
  
};

const debounceSearch = debounce((event) => onSearchChange(event));

document.addEventListener("DOMContentLoaded", async () => {
  const searchInput = document.querySelector("#search");
  searchInput.addEventListener("input", debounceSearch);
  searchInput.addEventListener("change", handleCitySelection);
});


const loadData=async()=>{
  const currentweather = await getcurrentweather(selectedCity);
  loadCurrentforecast(currentweather);
  const hourlyforecast = await getHourlyforecast(currentweather);
  loadHourlyforecast(currentweather, hourlyforecast);
  loadFiveDayForecast(hourlyforecast);
  loadFeelsLike(currentweather);
  loadHumidity(currentweather);
}
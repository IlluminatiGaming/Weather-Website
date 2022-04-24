
function getSecretKey() {
  const HTTP = new XMLHttpRequest()
  const URL = "http://localhost:3000/envkey"
  const data = JSON.stringify({
    "security": "pqiugbdjw1koi9fuh5r4ewi6w5o5f5uf"
  })

  HTTP.open("POST", URL, false)
  HTTP.setRequestHeader("Content-Type", "application/json")
  HTTP.send(data)

  return JSON.parse(HTTP.responseText)
}

function getLocationData() {
  const HTTP = new XMLHttpRequest()
  const URL = `https://api.openweathermap.org/geo/1.0/direct?q=${document.getElementById("city").value}&limit=10&appid=${getSecretKey().res}`
  
  HTTP.open("GET", URL, false)
  HTTP.send()
  
  const data = JSON.parse(HTTP.responseText)

  const popup = document.getElementById("locSelection")
  const popupBox = document.getElementById("locSelBox")
  popup.style.display = "block"

  window.onclick = function(event) {
    if (event.target == popup) {
      popup.style.display = "none";
      while (popupBox.lastElementChild) {
        popupBox.removeChild(popupBox.lastElementChild)
      }
    }
  }
  
  function lsTest() {
    try {
      localStorage.setItem("test", "testing")
      localStorage.removeItem("test")
      return true;
    } catch (e) {
      return false;
    }
  }

  if (lsTest() === true) {
    for (let index = 0; index < 10; index++) {
      
      const newButton = document.createElement("button")
      newButton.id = "button" + index
      const node = document.createTextNode(data[index].name + ", " + ((data[index].state == undefined) ? "" : data[index].state + ", ") + data[index].country)
      newButton.appendChild(node)
      const div = document.getElementById("locSelBox")
      div.appendChild(newButton)
      div.appendChild(document.createElement("br"))
      document.getElementById("button" + index).onclick = function() {
        document.location = 'datapage.html'
        localStorage.setItem("lat", data[index].lat)
        localStorage.setItem("lon", data[index].lon)
      }
      
      newButton.style.height = '15%'
      newButton.style.width = '100%'
    }

  } else {
    const lsInfo = document.createElement("p")
    lsInfo.innerHTML = "LocalStorage is currently disabled. This site requires LocalStorage to pass data between pages. No user data is ever collected. "
                        + "For most browsers, find the setting titled similarly to: 'Allow all cookies' or 'Block third-party cookies' and enable that."
    popupBox.appendChild(lsInfo)
  }
}

function getWeatherData() {
  const HTTP = new XMLHttpRequest()
  const URL = `https://api.openweathermap.org/data/2.5/onecall?lat=${localStorage.getItem("lat")}&lon=${localStorage.getItem("lon")}&units=imperial&appid=${getSecretKey().res}`

  if (localStorage.getItem("dataFetched") != "true") {
    HTTP.open("GET", URL, false)
    HTTP.send()

    if (HTTP.responseType == 429) {
      document.getElementById("locHeader").innerHTML = "API Limit Surpassed. Please wait a minute and try again."
    } else {
      localStorage.setItem("dataFetched", "true")
      localStorage.setItem("data", HTTP.responseText)
      parseWeatherData(HTTP.responseText)
    }
  } else {
    parseWeatherData(localStorage.getItem("data"))
  }


}

function parseWeatherData(data) {
  const JSONdata = JSON.parse(data)

  const locHeader = document.getElementById("locHeader")
  
  const current = document.getElementById("current")
  current.style.display = "block"
  
  const temperature = document.getElementById("temperature")
  const feels_like = document.getElementById("feels_like")
  const humidity = document.getElementById("humidity")
  const dew_point = document.getElementById("dew_point")
  const wind_speed = document.getElementById("wind_speed")
  const condition = document.getElementById("condition")
  const description = document.getElementById("description")
  const conditionImg = document.getElementById("conditionImg")
  
  locHeader.innerHTML = "Currently viewing: (" + JSONdata.lat + ", " + JSONdata.lon + ")"
  
  //only use for dev testing
  //const output = document.getElementById("output")
  //output.innerHTML = "Data: " + data

  if (JSONdata.alerts == null) {
    const currentAlerts = document.createElement("p")
    currentAlerts.id = "currentAlerts"
    currentAlerts.innerHTML = "No current weather alerts"
    document.getElementById("alerts").appendChild(currentAlerts)

  } else {
    for (const x in JSONdata.alerts) {
      const currentAlerts = document.createElement("p")
      currentAlerts.id = "currentAlerts"
      const alertImg = document.createElement("img")
      alertImg.id = "alertImg"

      currentAlerts.innerHTML = JSONdata.alerts[x].event + " initiated by " + JSONdata.alerts[x].sender_name + "<br></br>" + JSONdata.alerts[x].description
      if (JSONdata.alerts[x].event.includes("warning") || JSONdata.alerts[x].event.includes("Warning")) {
        alertImg.src = "icons/redAlert.png"
      } else {
        alertImg.src = "icons/orangeAlert.png"
      }

      const holder = document.createElement("div")
      holder.id = "alertContainer"
      holder.appendChild(alertImg)
      holder.appendChild(currentAlerts)
      document.getElementById("alerts").appendChild(holder)
    }
  }

  temperature.innerHTML = "Current Temperature: " + JSONdata.current.temp + "°F"
  feels_like.innerHTML = "Current Feels Like: " + JSONdata.current.feels_like + "°F"
  humidity.innerHTML = "Current Humidity: " + JSONdata.current.humidity
  dew_point.innerHTML = "Current Dew Point: " + JSONdata.current.dew_point
  wind_speed.innerHTML = "Current Wind Speed: " + JSONdata.current.wind_speed + "mph"
  condition.innerHTML = "Current Conditions: " + JSONdata.current.weather[0].main
  description.innerHTML = "Description: " + JSONdata.current.weather[0].description

  conditionImg.src = imagePath(JSONdata.current.weather[0].id, JSONdata.current.weather[0].icon)


  for (const x in JSONdata.minutely) {
    const minutelyData = document.createElement("p")
    minutelyData.id = "minutely" + x
    minutelyData.className = "minutelyData"
    minutelyData.innerHTML = ((JSONdata.current.weather[0].description.includes("rain")) ? "Rainfall rate: " + (JSONdata.minutely[x].precipitation).toFixed(3) + " in/hr" : 
                         (JSONdata.current.weather[0].description.includes("snow")) ? "Snowfall rate: " + (JSONdata.minutely[x].precipitation).toFixed(3) + " in/hr" :
                         "No precip expected")
    document.getElementById("minutely").appendChild(minutelyData)

    /*
      TODO: look into Chart.js for rate chart
      Link: https://www.chartjs.org
    */

  }

  for (const x in JSONdata.hourly) {
    const hourly = document.getElementById("hourly")
    const hourlyData = document.createElement("div")
    const temperature = document.createElement("p")
    const feels_like = document.createElement("p")
    const humidity = document.createElement("p")
    const dew_point = document.createElement("p")
    const wind_speed = document.createElement("p")
    const condition = document.createElement("p")
    const description = document.createElement("p")
    const precipAccumulation = document.createElement("p")
    const conditionImg = document.createElement("img")

    hourlyData.id = "hourly" + x

    temperature.className = "hourlyData"
    feels_like.className = "hourlyData"
    humidity.className = "hourlyData"
    dew_point.className = "hourlyData"
    wind_speed.className = "hourlyData"
    condition.className = "hourlyData"
    description.className = "hourlyData"
    precipAccumulation.className = "hourlyData"

    temperature.innerHTML = "Temperature: " + JSONdata.hourly[x].temp + "°F"
    feels_like.innerHTML = "Feels Like: " + JSONdata.hourly[x].feels_like + "°F"
    humidity.innerHTML = "Humidity: " + JSONdata.hourly[x].humidity
    dew_point.innerHTML = "Dew Point: " + JSONdata.hourly[x].dew_point
    wind_speed.innerHTML = "Wind Speed: " + JSONdata.hourly[x].wind_speed + "mph"
    condition.innerHTML = "Conditions: " + JSONdata.hourly[x].weather[0].main
    description.innerHTML = "Description: " + JSONdata.hourly[x].weather[0].description
    precipAccumulation.innerHTML = ((JSONdata.hourly[x].rain == null && JSONdata.hourly[x].snow == null) ? "No expected precip" : 
      (JSONdata.hourly[x].rain != null && JSONdata.hourly[x].snow == null) ? "Expected Hourly Rain: " + (JSONdata.hourly[x].rain["1h"] / 25.4).toFixed(2) + "in" :
      (JSONdata.hourly[x].rain == null && JSONdata.hourly[x].snow != null) ? "Expected Hourly Snowfall: " + (JSONdata.hourly[x].snow["1h"] / 25.4).toFixed(2) + "in" :
      "Expected Rainfall: " + (JSONdata.daily[x].rain / 25.4).toFixed(2) + "in \nExpected Snowfall: " + (JSONdata.daily[x].snow / 25.4).toFixed(2) + "in")

    conditionImg.src = imagePath(JSONdata.hourly[x].weather[0].id, JSONdata.hourly[x].weather[0].icon)

    hourlyData.appendChild(temperature)
    hourlyData.appendChild(feels_like)
    hourlyData.appendChild(humidity)
    hourlyData.appendChild(dew_point)
    hourlyData.appendChild(wind_speed)
    hourlyData.appendChild(condition)
    hourlyData.appendChild(description)
    hourlyData.appendChild(precipAccumulation)
    hourlyData.appendChild(conditionImg)
    hourly.appendChild(hourlyData)

    /*
      TODO: make dropdown menu for these
    */

  }

  for (const x in JSONdata.daily) {
    const daily = document.getElementById("daily")
    const dailyData = document.createElement("div")
    const maxTemp = document.createElement("p")
    const minTemp = document.createElement("p")
    const humidity = document.createElement("p")
    const dew_point = document.createElement("p")
    const wind_speed = document.createElement("p")
    const condition = document.createElement("p")
    const description = document.createElement("p")
    const precipChance = document.createElement("p")
    const precipAccumulation = document.createElement("p")
    const conditionImg = document.createElement("img")

    dailyData.id = "daily" + x

    maxTemp.className = "dailyData"
    minTemp.className = "dailyData"
    humidity.className = "dailyData"
    dew_point.className = "dailyData"
    wind_speed.className = "dailyData"
    condition.className = "dailyData"
    description.className = "dailyData"
    precipChance.className = "dailyData"
    precipAccumulation.className = "dailyData"

    maxTemp.innerHTML = "High Temperature: " + JSONdata.daily[x].temp.max + "°F"
    minTemp.innerHTML = "Low Temperature: " + JSONdata.daily[x].temp.min + "°F"
    humidity.innerHTML = "Humidity: " + JSONdata.daily[x].humidity
    dew_point.innerHTML = "Dew Point: " + JSONdata.daily[x].dew_point
    wind_speed.innerHTML = "Wind Speed: " + JSONdata.daily[x].wind_speed + "mph"
    condition.innerHTML = "Conditions: " + JSONdata.daily[x].weather[0].main
    description.innerHTML = "Description: " + JSONdata.daily[x].weather[0].description
    precipChance.innerHTML = "Chance of Precip: " + (JSONdata.daily[x].pop * 100).toFixed(0) + "%"
    precipAccumulation.innerHTML = ((JSONdata.daily[x].rain == null && JSONdata.daily[x].snow == null) ? "No expected precip" : 
    (JSONdata.daily[x].rain != null && JSONdata.daily[x].snow == null) ? "Expected Rainfall: " + (JSONdata.daily[x].rain / 25.4).toFixed(2) + "in" :
    (JSONdata.daily[x].rain == null && JSONdata.daily[x].snow != null) ? "Expected Snowfall: " + (JSONdata.daily[x].snow / 25.4).toFixed(2) + "in" :
    "Expected Rainfall: " + (JSONdata.daily[x].rain / 25.4).toFixed(2) + "in \nExpected Snowfall: " + (JSONdata.daily[x].snow / 25.4).toFixed(2) + "in")

    conditionImg.src = imagePath(JSONdata.daily[x].weather[0].id, JSONdata.daily[x].weather[0].icon)

    dailyData.appendChild(maxTemp)
    dailyData.appendChild(minTemp)
    dailyData.appendChild(humidity)
    dailyData.appendChild(dew_point)
    dailyData.appendChild(wind_speed)
    dailyData.appendChild(condition)
    dailyData.appendChild(description)
    dailyData.appendChild(precipChance)
    dailyData.appendChild(precipAccumulation)
    dailyData.appendChild(conditionImg)
    daily.appendChild(dailyData)

  }
}

function imagePath(id, icon) {
  if ([200, 210, 211, 230, 231, 232].includes(id)) {
    return "icons/lightThunderstorm.png"
  } else if ([201, 211].includes(id)) {
    return "icons/thunderstorm.png"
  } else if ([202, 212].includes(id)) {
    return "icons/heavyThunderstorm.png"
  } else if ([300, 301, 302, 310, 311, 312, 313, 314, 321, 500, 520, 521, 522, 531].includes(id)) {
    return "icons/rainShower.png"
  } else if ([501].includes(id)) {
    return "icons/rain.png"
  } else if ([502, 503, 504].includes(id)) {
    return "icons/heavyRain.png"
  } else if ([600, 620, 621, 622].includes(id)) {
    return "icons/snowShower.png"
  } else if ([601].includes(id)) {
    return "icons/snow.png"
  } else if ([511, 611, 612, 613].includes(id)) {
    return "icons/mixedPrecip.png"
  } else if ([615, 616].includes(id)) {
    return "icons/rainAndSnow.png"
  } else if ([800].includes(id) && icon.includes("d")) {
    return "icons/clearDay.png"
  } else if ([800].includes(id) && icon.includes("n")) {
    return "icons/clearNight.png"
  } else if ([801, 802].includes(id) && icon.includes("d")) {
    return "icons/partlyCloudyDay.png"
  } else if ([801, 802].includes(id) && icon.includes("n")) {
    return "icons/partlyCloudyNight.png"
  } else if ([803].includes(id)) {
    return "icons/mostlyCloudy.png"
  } else if ([804].includes(id)) {
    return "icons/cloudy.png"
  } else {
    return "icons/redAlert.png"
  }
}

function dropdown() {
  const dropdownContent = document.getElementById("dropdownContent")
  if (dropdownContent.style.display == "") {
    dropdownContent.style.display = "block"
  } else {
    dropdownContent.style.display = ""
  }
}

function dataToggle() {
  window.scrollTo(0, 0)
  const current = document.getElementById("current")
  const minutely = document.getElementById("minutely")
  const hourly = document.getElementById("hourly")
  const daily = document.getElementById("daily")

  const currentButton = document.getElementById("currentButton")  
  const minutelyButton = document.getElementById("minutelyButton")
  const hourlyButton = document.getElementById("hourlyButton")  
  const dailyButton = document.getElementById("dailyButton")

  const dataNav = document.getElementById("dataNav")

  window.onclick = function(event) {
    if (event.target == currentButton) {
      if (current.style.display == "block") {
        current.style.display = "none"
      } else if (minutely.style.display == "block") {
        minutely.style.display = "none"
      } else if (hourly.style.display == "block") {
        hourly.style.display = "none"
      } else if (daily.style.display == "block") {
        daily.style.display = "none"
      }

      current.style.display = "block"
      dataNav.innerHTML = "&#9776 Currently Viewing: Current"
      dropdown()
    } else if (event.target == minutelyButton) {
      if (current.style.display == "block") {
        current.style.display = "none"
      } else if (minutely.style.display == "block") {
        minutely.style.display = "none"
      } else if (hourly.style.display == "block") {
        hourly.style.display = "none"
      } else if (daily.style.display == "block") {
        daily.style.display = "none"
      }

      minutely.style.display = "block"
      dataNav.innerHTML = "&#9776 Currently Viewing: Minutely"
      dropdown()
    } else if (event.target == hourlyButton) {
      if (current.style.display == "block") {
        current.style.display = "none"
      } else if (minutely.style.display == "block") {
        minutely.style.display = "none"
      } else if (hourly.style.display == "block") {
        hourly.style.display = "none"
      } else if (daily.style.display == "block") {
        daily.style.display = "none"
      }

      hourly.style.display = "block"
      dataNav.innerHTML = "&#9776 Currently Viewing: Hourly"
      dropdown()
    } else if (event.target == dailyButton) {
      if (current.style.display == "block") {
        current.style.display = "none"
      } else if (minutely.style.display == "block") {
        minutely.style.display = "none"
      } else if (hourly.style.display == "block") {
        hourly.style.display = "none"
      } else if (daily.style.display == "block") {
        daily.style.display = "none"
      }

      daily.style.display = "block"
      dataNav.innerHTML = "&#9776 Currently Viewing: Daily"
      dropdown()
    }
  }
}
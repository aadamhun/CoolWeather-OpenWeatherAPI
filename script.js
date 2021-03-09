const apikey = "INSERT YOUR OWN KEY HERE";

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0
};
var cover = document.getElementById("coverpage");
var details = document.getElementById("details");
var days = {};

document.addEventListener('DOMContentLoaded', function() {
	closeDetails();
	coverpage.addEventListener("click", function(e){
		if(e.target == this)
			closeDetails();
	});
    var loc = navigator.geolocation.getCurrentPosition(getCoords, error, options);
}, false);
document.getElementById("location").addEventListener("keydown", function(e){
		if(e.keyCode == 13){
		getWeather({city: this.value}, function(arr){
			//console.log(arr);
			document.getElementById("forecast").innerHTML = "";
			setInputText(`${arr.city.name}, ${arr.city.country}`);
			days = {};
			for (let i = 0; i < arr.list.length; i++) {
				let item = arr.list[i];
				let dateInText = getDateinText(item.dt_txt);
				if(!days.hasOwnProperty(dateInText)){
					days[dateInText] = {
						timestamp: [],
						weather: [],
						weather_icon: [],
						temp: [],
						temp_min: [],
						temp_max: [],
						pressure: []
					};
				}
				days[dateInText].timestamp.push(item.dt);
				days[dateInText].weather.push(item.weather[0].main);
				days[dateInText].weather_icon.push(item.weather[0].icon);
				days[dateInText].temp.push(item.main.temp);
				days[dateInText].temp_min.push(item.main.temp_min);
				days[dateInText].temp_max.push(item.main.temp_max);
				days[dateInText].pressure.push(item.main.pressure);
			}
			for(day in days){
				let obj = averageAll(days[day]);
				obj.date = day;
				addItemToForecast(obj);
			}
		});
	}
});
function getCoords(position){
	var roundedCoords = {
		lat: position.coords.latitude,
		lon: position.coords.longitude
	}
	getWeather({coords: roundedCoords}, function(arr){
		//console.log(arr);
		setInputText(`${arr.city.name}, ${arr.city.country}`);
		days = {};
		for (let i = 0; i < arr.list.length; i++) {
			let item = arr.list[i];
			let dateInText = getDateinText(item.dt_txt);
			if(!days.hasOwnProperty(dateInText)){
				days[dateInText] = {
					timestamp: [],
					weather: [],
					weather_icon: [],
					temp: [],
					temp_min: [],
					temp_max: [],
					pressure: []
				};
			}
			days[dateInText].timestamp.push(item.dt);
			days[dateInText].weather.push(item.weather[0].main);
			days[dateInText].weather_icon.push(item.weather[0].icon);
			days[dateInText].temp.push(item.main.temp);
			days[dateInText].temp_min.push(item.main.temp_min);
			days[dateInText].temp_max.push(item.main.temp_max);
			days[dateInText].pressure.push(item.main.pressure);
		}
		for(day in days){
			let obj = averageAll(days[day]);
			obj.date = day;
			//console.log(days);
			//console.log(obj);
			addItemToForecast(obj);
		}
	});
}
function error(err) {
  console.warn(`ERROR(${err.code}): ${err.message}`);
  setInputText("");
}
function getDateinText(str){
	return str.substr(0,10);
}
function averageAll(obj){
	var r = {};
	for(key in obj){
		if(key !== "weather" && key !== "weather_icon"){
			if(key !== "temp"){
				r[key] = average(obj[key]);
			}
			else{
				r[key] = Math.max(...obj[key]);
			}
		}
		else{
			if(key === "weather"){
				r[key] = mode(obj[key]);
				r["weather_icon"] = obj["weather_icon"][obj[key].indexOf(r[key])];
			}
		}
	}
	return r;
}
function average(arr){
	var sum, avg = 0;
	if (arr.length)
	{
	    sum = arr.reduce(function(a, b) { return a + b; });
	    avg = sum / arr.length;
	}
	return avg;
}
function getWeather(location, callback)
{
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.onreadystatechange = function() {
    	if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(JSON.parse(xmlHttp.responseText));
        else if(xmlHttp.readyState == 4 && xmlHttp.status == 404){
			setInputText(`Error: ${JSON.parse(xmlHttp.responseText).message}`);
        }
    }
    var params = "";
    if(location.hasOwnProperty("city")) params = `q=${location.city}`;
    else if (location.hasOwnProperty("coords")) params = `lat=${location.coords.lat}&lon=${location.coords.lon}`;
    //console.log(params);
    xmlHttp.open("GET", `https://api.openweathermap.org/data/2.5/forecast?${params}&appid=${apikey}`, true);
    xmlHttp.send(null);
}
function setInputText(text){
	document.getElementById("location").value = text;
}
var forecastWrapper = document.getElementById("forecast");
function addItemToForecast(obj){
	var short = {
		weather: obj.weather, //.join("/")
		temp: kelvinToCelsius(obj.temp),
	}
	var itemWrapper = createElementWithClass("div","forecast--item");
	itemWrapper.addEventListener("click", function(){
		showDetailedForecast(obj.date);
	});
	var itemHeading = createElementWithClass("h2", "", obj.date);
	itemWrapper.appendChild(itemHeading);
	for(key in short){
		if(key === "weather" || key === "icon"){
			let newItem = createElementWithClass("i", `wi ${getIcon(obj.weather_icon)}`);
			itemWrapper.appendChild(newItem);
		}
		let newItem = createElementWithClass("h3",key,short[key]);
		itemWrapper.appendChild(newItem);
	}
	forecastWrapper.appendChild(itemWrapper);
}
function createElementWithClass(tagName, className, content){
	className = className || "";
	var tag = document.createElement(tagName);
	tag.className = className;
	if(content){
		var t = document.createTextNode(content);
		tag.appendChild(t);
	}
	return tag;
}
function kelvinToCelsius(k) {
	return `${Math.round(k-273.15)} °C`;
}
function showDetailedForecast(date){
	coverpage.className = "visible";
	var btn = document.createElement("a");
	btn.href = "#";
	btn.className = "closeBtn";
	btn.innerText = "×";
	btn.addEventListener("click", closeDetails);
	details.appendChild(btn);
	var flex = document.createElement("div");
	flex.id = "details--flexbox";
	var heading = createElementWithClass("h2", "", date);
	details.appendChild(heading);
	details.appendChild(flex);
	for (var i = 0; i < days[date].timestamp.length; i++) {
		var wrapper = document.createElement("div");
		//console.log(days[date]);
		var item = createElementWithClass("h3", "time", timestampToTime(days[date].timestamp[i]));
		wrapper.appendChild(item);
		item = createElementWithClass("i", `wi ${getIcon(days[date].weather_icon[i])}`);
		wrapper.appendChild(item);
		if(!days[date].weather[i]) days[date].weather[i] = days[date].weather[i-1];
		item = createElementWithClass("h3", "weather", days[date].weather[i]);
		wrapper.appendChild(item);
		item = createElementWithClass("h3", "temp", kelvinToCelsius(days[date].temp[i]));
		wrapper.appendChild(item);
		flex.appendChild(wrapper);
	}
}
function getIcon(weatherIcon){
	weatherIcon = weatherIcon || "01d";
	let key = `i${weatherIcon.substr(0, 2)}`;
	let i = weatherIcon.substr(-1) === "n" ? 0 : 1;

	var icons = {
		i01: ["day-sunny", "night-clear"],
		i02: ["day-cloudy", "night-alt-cloudy"],
		i03: ["cloud", "cloud"],
		i04: ["cloudy", "cloudy"],
		i09: ["rain", "rain"],
		i10: ["day-rain", "night-alt-rain"],
		i11: ["wi-thunderstorm", "wi-thunderstorm"],
		i13: ["wi-snow", "wi-snow"],
	};
	var r = `wi-${icons[key][i]}`;
	return r;
}
function mode(arr){
    return arr.sort((a,b) =>
          arr.filter(v => v===a).length
        - arr.filter(v => v===b).length
    ).pop();
}
function closeDetails(){
	coverpage.className = "";
	details.innerHTML = "";
}
function timestampToTime(ts){
	var d = new Date(ts*1000);
	return `${("0"+d.getHours()).substr(-2)}:${("0"+d.getMinutes()).substr(-2)}`;
}

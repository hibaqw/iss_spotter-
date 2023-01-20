// iss_promised.js
const request = require('request-promise-native');
const fetchMyIP = function() {
  // use request to fetch IP address from JSON API
  return request(`https://api64.ipify.org?format=json`);
};
const fetchCoordsByIP = function(body) {
  // use request to fetch IP address from JSON API
  const ip = JSON.parse(body).ip;
  return request(`http://ipwho.is/${ip}?fields=latitude,longitude`);
};
const fetchISSFlyOverTimes = function(body) {
  // use request to fetch IP address from JSON API
  const coordinates = JSON.parse(body);
  // console.log(typeof coordinates);
  const lat = coordinates["latitude"];
  const lon = coordinates["longitude"];

  

  return request(`https://iss-flyover.herokuapp.com/json/?lat=${lat}&lon=${lon}`);
};

const nextISSTimesForMyLocation = function() {
  return fetchMyIP()
    .then(fetchCoordsByIP)
    .then(fetchISSFlyOverTimes)
    .then((data) => {
      const { response } = JSON.parse(data);
      return response;
    });
};

module.exports = { nextISSTimesForMyLocation };

// module.exports = {fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes};

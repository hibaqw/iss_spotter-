const request = require('request');
const fetchMyIP = function(callback) {
  // use request to fetch IP address from JSON API
  request(`https://api64.ipify.org?format=json`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const data = JSON.parse(body);
    callback(null,data["ip"]);
  });
};


const fetchCoordsByIP = function(ip,callback) {
  request(`http://ipwho.is/${ip}?fields=latitude,longitude`, (error, response, body) => {
    // const data = JSON.parse(body);
    // const obj = {latitude: data["latitude"], longitude: data["longitude"]};
    if (error) {
      callback(error,null);
      return;
    }
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching Latitude and Longitude. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }

    const data = JSON.parse(body);
    if (data["success"] === false) {
      const message = `Success status was ${data.success}. Server message says: ${data.message} when fetching for IP ${data.ip}`;
      callback(Error(message), null);
    }
    const {latitude, longitude} = data;
    callback(null,{latitude,longitude});
  });
};
/**
 * Makes a single API request to retrieve upcoming ISS fly over times the for the given lat/lng coordinates.
 * Input:
 *   - An object with keys `latitude` and `longitude`
 *   - A callback (to pass back an error or the array of resulting data)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly over times as an array of objects (null if error). Example:
 *     [ { risetime: 134564234, duration: 600 }, ... ]
 */
const fetchISSFlyOverTimes = function(coordinates, callback) {
  const lat = coordinates["latitude"];
  const lon = coordinates["longitude"];
  request(`https://iss-flyover.herokuapp.com/json/?lat=${lat}&lon=${lon}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching ISS times. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    const data = JSON.parse(body);
    callback(null,data["response"]);
  });
};
// iss.js
/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 * - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {
  // empty for now
  fetchMyIP((error, ip) =>{
    if (error) {
      return callback(error,null);
    }
    fetchCoordsByIP(ip, (error,loc) => {
      if (error) {
        return callback(error,null);
      }
      fetchISSFlyOverTimes(loc,(error,nextPasses) => {
        if (error) {
          return callback(error,null);
        }
        callback(null,nextPasses);
      });

    });
  });
};
module.exports = { fetchMyIP, fetchCoordsByIP, fetchISSFlyOverTimes, nextISSTimesForMyLocation};
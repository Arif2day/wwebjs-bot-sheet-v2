const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join( __dirname,'../', '.env') });

function getRandomDelay() {
    const min = Math.ceil(process.env.DELAY_NTMIN);
    const max = Math.floor(process.env.DELAY_NTMAX);
    return Math.floor(Math.random()*(max-min+1)+min);
}

function countKeySumNumber(arr, key) {
    if (!Array.isArray(arr)) {
      throw new Error("The input must be an array.");
    }
  
    let count = 0;
    for (const obj of arr) {
      if (obj && typeof obj === 'object' && obj.hasOwnProperty(key) && obj[key]!=0) {
        count++;
      }
    }
    return count;
  }

function formatDate(date,type=1) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) 
        month = '0' + month;
    if (day.length < 2) 
        day = '0' + day;

    if(type==1){
        return [year, month, day].join('-');
    }else{
        return [day, month, year].join('-');
    }
}

function delayAFunction(t, val) {
    return new Promise(resolve => setTimeout(resolve, t, val));
}

function sanitizedNumber(number){
    // remove unnecessary chars from the number
    number = number.toString().replace(/[^0-9]/g, ''); 
    if(number.substr(0,1)=='0'){
        number='62'+number.substr(1,number.length);
    }else if(number.substr(0,1)=='8'){
        number='62'+number;
    }
    return number+"@c.us";
}

function convertToInterpolationString(str, obj) {
    return str.replace(/\{(\w+)\}/g, (match, key) => {
      return obj.hasOwnProperty(key) ? obj[key] : match;
    });
}

function currencyFormat(number) {
    return number.toLocaleString('id-ID', {
        style: 'currency',
        currency: 'IDR',
      });
}

function convertLocaleDate(date) {
    const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
    return date.toLocaleDateString("id-ID", options);
}

function findPropertyByPrefix(object, prefix) {
    for (var property in object) {
      if (object.hasOwnProperty(property) && 
         property.toString().startsWith(prefix)) {
         return object[property];
      }
    }
}

function calculateDueDates(startDate, interval, numberOfInstallments) {
    const dueDates = [];
    let currentDate = new Date(startDate);
  
    for (let i = 0; i < numberOfInstallments; i++) {
      dueDates.push(formatDate(new Date(currentDate),1));
      
      if (interval.toLowerCase() === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (interval.toLowerCase() === 'weekly') {
         currentDate.setDate(currentDate.getDate() + 7);
      } else if (interval.toLowerCase() === 'daily') {
         currentDate.setDate(currentDate.getDate() + 1);
      }
      else {
          throw new Error("Invalid interval. Must be 'daily', 'weekly', or 'monthly'.");
      }
    }
    return dueDates;
  }

  function findYoungestDate(dateStrings) {
    if (!dateStrings || dateStrings.length === 0) {
      return null; // Handle empty or invalid input
    }
  
    let youngestDate = dateStrings[0];
  
    for (let i = 1; i < dateStrings.length; i++) {
      if (new Date(dateStrings[i]) > new Date(youngestDate)) {
        youngestDate = dateStrings[i];
      }
    }
    return youngestDate;
  }

  function secondsToHHMMSS(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
  
    const formattedHours = String(hours).padStart(2, '0');
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
  }

  const updateObjectKey = (array, idx, key, value) => {
    return array.map(obj => {
      if (obj.idx === idx) {
        return { ...obj, [key]: value };
      }
      return obj;
    });
  };

module.exports = {
    formatDate: formatDate,
    sanitizedNumber: sanitizedNumber,
    convertToInterpolationString,convertToInterpolationString,
    currencyFormat:currencyFormat,
    convertLocaleDate:convertLocaleDate,
    getRandomDelay:getRandomDelay,
    countKeySumNumber:countKeySumNumber,
    findPropertyByPrefix:findPropertyByPrefix,
    calculateDueDates:calculateDueDates,
    findYoungestDate:findYoungestDate,
    secondsToHHMMSS:secondsToHHMMSS,
    delayAFunction:delayAFunction,
    updateObjectKey:updateObjectKey
};
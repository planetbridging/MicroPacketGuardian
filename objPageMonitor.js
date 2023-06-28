const { v4: uuidv4 } = require("uuid");

var fileHelper = require("./fileHelper");

class objPageMonitor {
  uniqPageSummary;
  uniqFileSummary;
  acceptedFileTypes;
  uuid;
  uniqGeoLocation;
  constructor(acceptedFileTypes) {
    this.uniqPageSummary = new Map();
    this.uniqFileSummary = new Map();
    this.uniqGeoLocation = new Map();
    this.acceptedFileTypes = acceptedFileTypes;
  }

  //need to capture: page/file Req,get/post variable
  //counts then add pushing into db

  processRequest(req, getCount) {
    var foundType = "";
    var found = false;
    var tmpObjGrab = {
      uuid: uuidv4(),
      loadCount: 1,
      getCount: 0,
      postCount: 0,
      geoLstUniq: [],
      geoLst: [],
      uniqCountry: [],
    };
    var tmpUrl = req.url;
    if (this.uniqPageSummary.has(req.url) || getCount > 0) {
      tmpUrl = fileHelper.getMainPath(req.url);
    }

    if (
      fileHelper.checkPathForAcceptedFileType(req.url, this.acceptedFileTypes)
    ) {
      foundType = "file";
      if (this.uniqFileSummary.has(tmpUrl)) {
        tmpObjGrab = this.uniqFileSummary.get(tmpUrl);
        found = true;
      }
    } else {
      foundType = "page";
      if (this.uniqPageSummary.has(tmpUrl)) {
        tmpObjGrab = this.uniqPageSummary.get(tmpUrl);
        found = true;
      }
    }
    tmpObjGrab.uuid = uuidv4();
    return [foundType, tmpObjGrab, tmpUrl, found];
  }

  cleanGeo(geo) {
    var longitude = "";
    var latitude = "";
    var city = "";
    var country = "";
    var timeZone = "";
    if (geo == null) {
      return null;
    }
    if (geo["ll"] == null) {
      return null;
    }
    latitude = geo["ll"][0];
    longitude = geo["ll"][1];
    city = geo["city"];
    country = geo["country"];
    timeZone = geo["timezone"];
    var tmpGeo = {
      latitude: latitude,
      longitude: longitude,
      city: city,
      country: country,
      timeZone: timeZone,
    };

    var tmpGeoItem = {
      name: tmpGeo.country + " - " + tmpGeo.city,
      value: [tmpGeo.longitude, tmpGeo.latitude, 1],
    };
    return [tmpGeo, tmpGeoItem];
  }

  //true = get, false = post for getOrPost
  requestCount(
    path,
    getCount,
    req,
    res,
    statusCode,
    geo,
    postCount,
    getOrPost
  ) {
    if (getOrPost == false) {
      getCount = 0;
    }

    var processReqTmp = this.processRequest(req, getCount);
    var tmpObjGrab = processReqTmp[1];
    var foundType = processReqTmp[0];
    var tmpUrl = processReqTmp[2];
    var found = processReqTmp[3];

    var cleanGeo = this.cleanGeo(geo);
    var tmpLatLong = "";

    tmpObjGrab["statusCode"] = statusCode;

    if (getCount > 0 && found) {
      //console.log("===", req.url);
      tmpObjGrab.getCount += getCount;
    }

    if (postCount > 0 && found) {
      //console.log("===", req.url);
      tmpObjGrab.postCount += postCount;
    }

    if (found) {
      tmpObjGrab.loadCount += 1;
    }

    if (cleanGeo != null) {
      tmpLatLong = cleanGeo[0].latitude + "," + cleanGeo[0].longitude;

      if (!tmpObjGrab.geoLstUniq.includes(tmpLatLong)) {
        var tmpLstGeoCodes = tmpObjGrab.geoLstUniq;
        var tmpLstGeoItems = tmpObjGrab.geoLst;
        tmpLstGeoCodes.push(tmpLatLong);
        tmpLstGeoItems.push(cleanGeo[0]);
        tmpObjGrab.geoLstUniq = tmpLstGeoCodes;
        tmpObjGrab.geoLst = tmpLstGeoItems;
      }

      if (!tmpObjGrab.uniqCountry.includes(cleanGeo[0].country)) {
        var tmpCountryLst = tmpObjGrab.uniqCountry;
        tmpCountryLst.push(cleanGeo[0].country);
        tmpObjGrab.uniqCountry = tmpCountryLst;
      }

      var geoMaptmp = cleanGeo[1];
      var urlPath = fileHelper.getMainPath(req.url);
      if (!this.uniqGeoLocation.has(tmpLatLong)) {
        geoMaptmp["pages"] = [urlPath];
        console.log(geoMaptmp);
        this.uniqGeoLocation.set(tmpLatLong, geoMaptmp);
      } else {
        var geoMaptmpGet = this.uniqGeoLocation.get(tmpLatLong);
        var tmpUrlLst = geoMaptmpGet["pages"];
        if (!tmpUrlLst.includes(urlPath)) {
          tmpUrlLst.push(urlPath);
          geoMaptmpGet["pages"] = tmpUrlLst;
        }

        this.uniqGeoLocation.set(tmpLatLong, geoMaptmpGet);
      }
    }

    if (foundType == "page") {
      this.uniqPageSummary.set(tmpUrl, tmpObjGrab);
      //console.log(this.uniqPageSummary);
    } else {
      this.uniqFileSummary.set(tmpUrl, tmpObjGrab);
    }

    this.uuid = uuidv4();
  }

  getRequestCount(path, getCount, req, res, statusCode, geo) {
    /*console.log("-----------------------------------------");
    console.log(path);
    console.log("------");
    console.log(getCount);
    console.log("------");
    console.log(req.url);
    console.log("------");
    //console.log(res);
    console.log("==========================================");*/
    /*
     */
    //tmpObjGrab.loadCount += 1;
  }
}

module.exports = objPageMonitor;

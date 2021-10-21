import axios from "axios";
import request from "request";
import ftp from "ftp-get";
import JSFtp from "jsftp";
import validUrl from "valid-url";

function parseAuth(authInput) {
  if (authInput) {
    const auth = authInput.split(":");
    if (auth[0] && auth[1]) {
      return {
        user: auth[0],
        pass: auth[1],
      };
    }
  }
  return {};
}

function processUrl(rawUrl) {
  let url = String(rawUrl);
  url = url.trim();
  url = require("url").parse(url);
  url.port = url.port || 21;

  const auth = parseAuth(url.auth);
  url.user = auth.user || "anonymous";
  url.pass = auth.pass || "anonymous@";

  // in order to save a CWD round trip
  // stripping the forward slash for files
  // at the apex of the FTP list
  // wu-ftpd + anonymous fails on these
  const path = url.pathname.split("/");
  if (path.length === 2) {
    url.pathftp = url.pathname.substring(1);
  } else {
    url.pathftp = url.pathname;
  }

  // ftp breaks on %20 and other stuff like this
  url.pathftp = decodeURIComponent(url.pathftp);

  return url;
}

function rewriteUrl(url) {
  const urlInfo = processUrl(url);
  if (urlInfo.protocol === "http:" || urlInfo.protocol === "https:") {
    return Promise.resolve({
      protocol: urlInfo.protocol,
      url,
    });
  }

  if (urlInfo.protocol === "ftp:") {
    if (urlInfo.pathftp.indexOf("/ /") > 0 && urlInfo.pathftp.endsWith("/")) {
      const urlParts = urlInfo.pathftp.split("/ /");
      const forlderPath = urlParts[0];
      const fileName = urlParts[1].slice(0, -1);
      const fileRegexp = new RegExp(fileName);

      const ftpConnection = new JSFtp({
        host: urlInfo.host,
        port: urlInfo.port,
        user: urlInfo.user,
        pass: urlInfo.pass,
      });

      return new Promise((resolve, reject) => {
        ftpConnection.ls(forlderPath, (err, res) => {
          if (err) {
            reject(err);
          }
          let fileUrl = null;
          for (const file of res) {
            if (fileRegexp.test(file.name)) {
              fileUrl = `${url.split("/ /")[0]}/${file.name}`;
              break;
            }
          }
          if (fileUrl) {
            resolve({
              protocol: urlInfo.protocol,
              url: fileUrl,
            });
          } else {
            reject(`Invalid FTP path: \`${urlInfo.pathftp}\``);
          }
        });
      });
    }

    return Promise.resolve({
      protocol: urlInfo.protocol,
      url,
    });
  }

  return Promise.reject(
    `Invalid URL protocol \`${urlInfo.protocol}\`. Supported protocols are \`http\`, \`https\`, and \`ftp\`.`
  );
}

function getHttpUrl(url) {
  return new Promise((resolve, reject) => {
    request(url, (error, response, body) => {
      if (error) {
        reject(error);
      } else if (response.statusCode !== 200) {
        reject(`Status code ${response.statusCode} received when requesting the URL \'${url}\'.`);
      } else {
        resolve(body);
      }
    });
  });
}

function getFtpUrl(url) {
  return new Promise((resolve, reject) => {
    ftp.get(url, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports.getUrl = function(url) {
  return rewriteUrl(url)
    .then((urlInfo) => {
      if (urlInfo.protocol === "http:" || urlInfo.protocol === "https:") {
        return getHttpUrl(urlInfo.url);
      }

      if (urlInfo.protocol === "ftp:") {
        return getFtpUrl(urlInfo.url);
      }

      return Promise.reject(`Invalid protocol \`${urlInfo.protocol}\``);
    });
}


module.exports.isValidUrl = function(url) {
  return validUrl.isUri(url);
}

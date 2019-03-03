"use strict";
require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const axios = require("axios");

// create LINE SDK config from env variables
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// register a webhook handler with middleware
// about the middleware, please refer to doc
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

getTemp();
// event handler
async function handleEvent(event) {
  if (event.type !== "message" || event.message.type !== "text") {
    // ignore non-text-message event
    return Promise.resolve(null);
  }

  const send_tem = await getTemp();

  // create a echoing text message
  const echo = { type: "text", text: send_tem };

  // use reply API
  return client.replyMessage(event.replyToken, echo);
}

async function getTemp() {
  let temp_;
  await axios
    .get("https://data.tmd.go.th/nwpapi/v1/forecast/location/daily/place", {
      params: {
        province: "สุโขทัย",
        amphoe: "เมืองสุโขทัย",
        fields: "tc,rh,cond",
        duration: 2
      },
      headers: {
        accept: "application/json",
        authorization:
          "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImRlZDkxYmI4ZjE0Y2JlYjgyOWJhNTI3MDkyNGYyZDljMTg0NzIxMzQ2MWI5YWI0NzljNDU2MTRhZWQyZWU0MGE5MTFkY2U3MzI3OWFhYzBiIn0.eyJhdWQiOiIyIiwianRpIjoiZGVkOTFiYjhmMTRjYmViODI5YmE1MjcwOTI0ZjJkOWMxODQ3MjEzNDYxYjlhYjQ3OWM0NTYxNGFlZDJlZTQwYTkxMWRjZTczMjc5YWFjMGIiLCJpYXQiOjE1NTE1OTY0NzUsIm5iZiI6MTU1MTU5NjQ3NSwiZXhwIjoxNTgzMjE4ODc1LCJzdWIiOiIzOTkiLCJzY29wZXMiOltdfQ.Z2MIZG5DlgQUpZwQI_f-EXUJPPpxPxw8A8MOinwu3-9_PCqTX6NxuGfnljiXUXN_IJGvQVxKnBzuB_MHXGQz9-akHwJb-_msgu29edSLi6sU35X1Li03iiCAnF2Cu0D9KVmA0OOZxBt1BHLeyoLgqq489unyZFKGBjQWDz8iUQYAdh3D4u21qDF101RoW91NhxBWOaD1cylM1yK7yewO4kwT7q_wQK8E0bxWgUvX3nU6gLdTXVNszhsLQBVmoc4LqiJIIyCdNtshTH_ZBxxtnW8AtMrvdTyaaBE0jLBfhECY1Xf03AJHcJ7xYJIW-beG5KdK4Ogl9ODqxBlu2WKNJ5PZ7GXI24h1mEX9sfM0HqF-Qcdvvm8qXBKbgMkbQEG5elYXaxVf7I5X5b5VxV8gb3AyFV0Y_JVxV2Ot_PIM1TmlefkOqxlIRyChR1NbLm7r_2KSjRrJ3JlHjR22uZVt29BhOstmrWRNRn0QqPtylkkVD-zmJmYmmQ1iJUwFzj461c2WU27YKSMWDFGIHcMDa1uoOecx4k2hYIxFMTJlrdLr33B8vPDe5diWUygiK42jhdwNIhjeKf8M9S1ihUSbZq8PbT3nDRPz85g8bF4rw3FfxBdHLIOmCfeRTxCkGPBz3nU5-_wRjqVDNaP8jrLq8wl-Zx1qintmXG1-g-MekBk"
      }
    })
    .then(function(response) {
      // handle success

      let Temperature =
        response.data.WeatherForecasts[0].forecasts[1].data.tc + "°C";
      // console.log(Temperature);
      let Weather = Weather_condition(
        response.data.WeatherForecasts[0].forecasts[1].data.cond
      );
      // console.log(Weather);
      temp_ = Temperature + " " + Weather;
    })
    .catch(function(error) {
      // handle error
      console.error("error", error);
      temp_ = "error";
    });
  return temp_;
}

function Weather_condition(params) {
  switch (params) {
    case 1:
      return "ท้องฟ้าแจ่มใส";
      break;

    default:
      return " ";
      break;
  }
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});

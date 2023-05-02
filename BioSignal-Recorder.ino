// EXG-Visualizer
// https://github.com/upsidedownlabs/BioSignal-Recorder

// Copyright (c) 2021 Moteen Shah moteenshah.02@gmail.com


// Upside Down Labs invests time and resources providing this open source code,
// please support Upside Down Labs and open-source hardware by purchasing
// products from Upside Down Labs!
// Copyright (c) 2021 Upside Down Labs - contact@upsidedownlabs.tech

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.


// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

#include <WebSocketsServer.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <SPIFFS.h>
#include <driver/adc.h>


#define ADC_PIN 36

WebSocketsServer webSocket = WebSocketsServer(81);
const char *SSID = "Rosy";
const char *PASSWORD = "mahesh@6902";

String myString[2] = {"0", "0"}; //1st index used for ADC data, 2nd as packet number


String JSONtxt;
AsyncWebServer server(80);


volatile int interruptCounter;
int totalInterruptCounter;

hw_timer_t * timer = NULL;
portMUX_TYPE timerMux = portMUX_INITIALIZER_UNLOCKED;

void IRAM_ATTR onTimer() {
  portENTER_CRITICAL_ISR(&timerMux);
  interruptCounter++;
  portEXIT_CRITICAL_ISR(&timerMux);

}


void setup()
{
  Serial.begin(115200);

  adc1_config_width(ADC_WIDTH_BIT_12);
  adc1_config_channel_atten(ADC1_CHANNEL_0, ADC_ATTEN_DB_11);

  if (!SPIFFS.begin()) {
    Serial.println("An Error has occurred while mounting SPIFFS");
    return;
  }

  WiFi.begin(SSID, PASSWORD);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi..");
  }

  Serial.println("");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/", HTTP_GET, [](AsyncWebServerRequest * request)
  {
    request->send(SPIFFS, "/index.html");
  });

  server.begin();
  webSocket.begin();
  webSocket.onEvent(callback);

}

bool sample = false;
int sampling_rate = 100;
void callback(byte num, WStype_t type, uint8_t * payload, size_t length)
{
  switch (type)
  {
    case WStype_DISCONNECTED:
      Serial.println("Client Disconnected");
      sample = false;
      break;
    case WStype_CONNECTED:
      Serial.println("Client connected");
      sample = true;
      break;
    case WStype_TEXT:
      String rate;
      for (int i = 0; i < length; i++)
      {
        rate += (char)payload[i];
      }
      rate += '\n';
      Serial.println(rate);
      sampling_rate = rate.toInt();
      break;
  }

  int tick_count = 1000000 / sampling_rate;
  if (sample)
  {
    timer = timerBegin(0, 80, true);
    timerAttachInterrupt(timer, &onTimer, true);
    timerAlarmWrite(timer, tick_count, true);
    timerAlarmEnable(timer);
  }

}


static long num_counter = 0;
static long ascii_counter = 65;

void loop() {
  webSocket.loop();


  if (interruptCounter > 0) {

    portENTER_CRITICAL(&timerMux);
    interruptCounter--;
    portEXIT_CRITICAL(&timerMux);
    if (sample)
    {
      if (num_counter < 1000)
      {
        num_counter++;
      }
      else
      {
        num_counter = 0;
        if (ascii_counter < 90)
        {
          ascii_counter++;
        }
        else
        {
          ascii_counter = 65;
        }

      }

      myString[0] = String(adc1_get_raw(ADC1_CHANNEL_0 ));
      myString[1] = (char)ascii_counter + String(num_counter);

      JSONtxt = "{\"ADC1\":\"" + myString[0] + "\",";
      JSONtxt += "\"ADC2\":\"" + myString[1] + "\"}";

      webSocket.broadcastTXT(JSONtxt);
    }

  }
}

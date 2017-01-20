#include <ESP8266WiFi.h>
#include <Adafruit_NeoPixel.h>

#define PIN_BLINK 15
#define PIN_PUMP  14
#define PIN_HUMI  12
#define PIN_LED   13
#define CNT_LED   60

Adafruit_NeoPixel strip(CNT_LED, PIN_LED, NEO_GRB + NEO_KHZ800);

const char *ssid = "wifi_ap0";
const char *password = "hu1huone@";

void WiFiEvent(WiFiEvent_t event){
  Serial.printf("[WiFi-event] event: %d\n", event);
  
  switch(event){
    case WIFI_EVENT_STAMODE_GOT_IP:
      Serial.println("WiFi connected");
      Serial.println("IP address: ");
      Serial.println(WiFi.localIP());
      break;
      
    case WIFI_EVENT_STAMODE_DISCONNECTED:
      Serial.println("WiFi lost connection");
      break;
  }
}

void setup(){
  pinMode(PIN_BLINK, OUTPUT);
  pinMode(PIN_PUMP, OUTPUT);
  pinMode(PIN_HUMI, OUTPUT);
  
  Serial.begin(115200);

  strip.begin();

  for(uint8_t i = 0; i < CNT_LED; i++){
    strip.setBrightness(180);
    strip.setPixelColor(i, 0xFF, 0xFF, 0xFF);
    strip.show();
    
    Serial.print(".");
    delay(80);
  }
  Serial.print("\r\n");
  
  // delete old config
  WiFi.disconnect(true);
  
  delay(1000);
  
  WiFi.onEvent(WiFiEvent);
  
  WiFi.begin(ssid, password);
  
  Serial.println();
  Serial.println();
  Serial.println("Wait for WiFi... ");
}

void loop(){
  digitalWrite(PIN_BLINK, HIGH);
  digitalWrite(PIN_PUMP, HIGH);
  digitalWrite(PIN_HUMI, HIGH);
  delay(15000);
  digitalWrite(PIN_BLINK, LOW);
  digitalWrite(PIN_PUMP, LOW);
  digitalWrite(PIN_HUMI, LOW);
  delay(15000);
}

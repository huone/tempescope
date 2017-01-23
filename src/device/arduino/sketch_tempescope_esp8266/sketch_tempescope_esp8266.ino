#define DBG_LOG_SERIAL

#ifdef DBG_LOG_SERIAL
#define DBG_print(_MSG_)            {Serial.print(_MSG_);}
#define DBG_println(_MSG_)          {Serial.print(_MSG_);Serial.print("\r\n");}
#define DBG_printChar(_MSG_, _LEN_) {for(uint32_t i = 0; i < len; i++){Serial.print((char)_MSG_[i]);}}
#else
#define DBG_print(_MSG_)            do{}while(0);
#define DBG_println(_MSG_, _NL_)    do{}while(0);
#define DBG_printChar(_MSG_, _LEN_) do{}while(0);
#endif

#include <ESP8266WiFi.h>
#include <Adafruit_NeoPixel.h>

#define PIN_PUMP  14
#define PIN_HUMI  12
#define PIN_LED   13
#define CNT_LED   60

#define PIN_BLINK 15
#define PIN_SPK   4

#define HOST_NAME   "192.168.124.23" //"192.168.124.23"  //"192.168.0.151"
#define HOST_PORT   3081
#define CLIENT_ID   "p001"
#define WIFI_SSID   "wifi_ap0"
#define WIFI_PWD    "hu1huone@"

Adafruit_NeoPixel strip(CNT_LED, PIN_LED, NEO_GRB + NEO_KHZ800);

char* httpReq = "GET /tempescopes/%s/%s%s HTTP/1.1\r\nHost: %s\r\nConnection: close\r\n\r\n";
bool hasNextEffect = false;

uint8_t effectRepeat = 0;
uint8_t buf[420] = {'0','0','0','0',0,};
uint8_t* code_buf = buf;
uint8_t* msg_buf = buf + 5;

uint32_t recvEffect(WiFiClient* client, uint8_t *buffer, uint32_t buffer_size);
uint32_t parseHexStr(const char* str, uint8_t digit);

#define CNT_PARSER  6
typedef uint32_t (*parser_t)(void*);
uint32_t parseColor(void* msg);
uint32_t parseBrightness(void* msg);
uint32_t parsePump(void* msg);
uint32_t parseHumidifier(void* msg);
uint32_t parseDelay(void* msg);
uint32_t parseRepeat(void* msg);

struct ParserMap {
  char idChar;
  parser_t parser;
} parserMap[CNT_PARSER] = {
  {'C', parseColor},
  {'B', parseBrightness},
  {'P', parsePump},
  {'H', parseHumidifier},
  {'D', parseDelay},
  {'R', parseRepeat}
};

void WiFiEvent(WiFiEvent_t event){
  //Serial.printf("[WiFi-event] event: %d\n", event);
  
  switch(event){
    case WIFI_EVENT_STAMODE_GOT_IP:
      DBG_println("WiFi connected");
      DBG_print("IP address: ");
      DBG_println(WiFi.localIP());
      break;
      
    case WIFI_EVENT_STAMODE_DISCONNECTED:
      DBG_println("WiFi lost connection");
      break;
  }
}

void setup(){
  pinMode(PIN_BLINK, OUTPUT);
  pinMode(PIN_SPK, OUTPUT);
  pinMode(PIN_PUMP, OUTPUT);
  pinMode(PIN_HUMI, OUTPUT);

  tone(PIN_SPK, 800, 200);
  strip.begin();

#ifdef DBG_LOG_SERIAL
  Serial.begin(115200);
#endif

  DBG_print("\r\n===== Begin Setup =====\r\n");
  
  for(uint8_t i = 0; i < CNT_LED; i++){
    strip.setBrightness(180);
    strip.setPixelColor(i, 0xFF, 0xFF, 0xFF);
    strip.show();
    
    Serial.print(".");
    delay(60);
  }
  
  DBG_println("\r\nBegin WiFi Setting");  
    
  // delete old config
  WiFi.disconnect(true);
  
  delay(1000);
  
  WiFi.onEvent(WiFiEvent);
  
  WiFi.begin(WIFI_SSID, WIFI_PWD);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    DBG_print(".");
  }
  
  DBG_print("\r\n");
}

void loop(){
  int32_t len = 0, i;
  uint8_t done = 0;
  
  WiFiClient client;
  
  const int httpPort = 80;
  if (!client.connect(HOST_NAME, HOST_PORT)) {
    DBG_println("connection failed");
    return;
  }

  DBG_println("TCP Connection OK");
  
  if(hasNextEffect){
    sprintf((char*)msg_buf, httpReq, CLIENT_ID, "effects/", code_buf, HOST_NAME);
  } else {
    sprintf((char*)msg_buf, httpReq, CLIENT_ID, "effect", "", HOST_NAME);
  }

  client.print((char*)msg_buf);
  
  int timeout = millis() + 5000;
  
  while (client.available() == 0) {
    if (timeout - millis() < 0) {
      DBG_println(">>> Client Timeout !");
      client.stop();
      return;
    }
  }

  len = recvEffect(&client, buf, sizeof(buf) - 1);
  if(len > 0){
    DBG_print("Received:[");
    DBG_printChar(buf, (uint32_t)len + 5);
    DBG_println("]");

#if 1
    do {
      i = 0;
      
      while(i < len){
        for(uint8_t j = 0; j < CNT_PARSER; j++){
          if (msg_buf[i] == parserMap[j].idChar){
            i += parserMap[j].parser((void*)&msg_buf[i + 1]);
            break;
          }
        }
        i++;
      }
      done++;
    } while(effectRepeat - (done - 1) > 0);
#endif
  }

  client.stop();
  
  if(strncmp((char*)code_buf, (char*)"0000", 4) == 0)
  {
    hasNextEffect = false;
    
    DBG_println("delay 10sec");
    delay(10000);
  } else {
    hasNextEffect = true;
  }
}

uint32_t recvEffect(WiFiClient* client, uint8_t *buffer, uint32_t buffer_size)
{
  String data;
  char a;

  uint32_t i, ret = 0;

  uint8_t* buf = buffer + 5;
  uint32_t buf_size = buffer_size - 5;

  char* key = "act";
  char* key_next = "next";
  
  uint8_t matched_num = 0;
  uint8_t complete_num = 0;
  
  bool begin_value = 0;
  
  if(buffer == NULL || buffer_size < 5){
      return 0;
  }

  while(client->available()){
    a = client->read();

    if(complete_num < 2){
      if(begin_value){
        if(matched_num < 3){
          if(a == '\"'){
            matched_num++;
          } else if(i < buf_size && a != ' ' && a != ':' && a != ','){
            buf[i++] = a;
          }
        } else {
          complete_num++;
          
          buf = buffer;
          buf_size = 4;
          key = key_next;

          begin_value = false;
          matched_num = 0;
        }
      } else {
        if(a == *(key + matched_num)){
          if(++matched_num == strlen(key)){
            begin_value = true;
            matched_num = 0;
            
            ret = i;
            i = 0;
          }
        } else {
          matched_num = 0;
        }
      }
    }
  }

  return ret;
}

uint32_t parseHexStr(const char** str, uint8_t digit)
{
  uint32_t c, m, v = 0;
  float e = 0.01f;
  
  for(uint8_t i = 0; i < digit; i++){
    c = (*str)[i];
    m = (uint32_t)(pow(2, 4 * (digit - 1 - i)) + e);
    
    if(c >= '0' && c <= '9'){
      v += (c - '0') *  m;
    } else if(c >= 'A' && c <= 'F'){
      v += ((c - 'A') + 10) * m;
    }
  }

  (*str) += 2;
  
  return v;
}

uint32_t parseColor(void* msg){
  static uint8_t LEN_MSG = 10;
  
  const char* p = (const char*)msg;
  uint8_t r = (uint8_t)parseHexStr(&p, 2);
  uint8_t g = (uint8_t)parseHexStr(&p, 2);
  uint8_t b = (uint8_t)parseHexStr(&p, 2);
  uint8_t s = (uint8_t)parseHexStr(&p, 2);
  uint8_t c = (uint8_t)parseHexStr(&p, 2);

  DBG_println("parseColor()");

  for(uint8_t i = 0; i < c; i++){
    strip.setPixelColor(i + s, r, g, b);
  }
  
  strip.show();

  return LEN_MSG;
}

uint32_t parseBrightness(void* msg){
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  DBG_println("parseBrightness()");
  
  strip.setBrightness(v);
  strip.show();

  return LEN_MSG;
}

uint32_t parsePump(void* msg){
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  DBG_println("parsePump()");
  
  digitalWrite(PIN_PUMP, v > 0 ? HIGH : LOW);

  return LEN_MSG;
}

uint32_t parseHumidifier(void* msg){
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  DBG_println("parseHumidifier()");

  digitalWrite(PIN_HUMI, v > 0 ? HIGH : LOW);
  
  return LEN_MSG;
}

uint32_t parseDelay(void* msg){
  static uint8_t LEN_MSG = 4;
  
  const char* p = (const char*)msg;
  uint16_t v = (uint16_t)parseHexStr(&p, 4);

  DBG_println("parseDelay()");

  delay(v * 10);
  
  return LEN_MSG;
}

uint32_t parseRepeat(void* msg){
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  DBG_println("parseRepeat()");

  effectRepeat = v;
  
  return LEN_MSG;
}

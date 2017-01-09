#define LOG_SERIAL

#include <Adafruit_NeoPixel.h>
#include <ESP8266.h>

#define PIN_PUMP  6
#define PIN_HUMI  7
#define PIN_LED   8
#define CNT_LED   60

#define SVR_MSG_LEN       4
#define SVR_MSG_CONNECTED "0001"
#define SVR_MSG_READY     "0002"

#define SSID        "wifi_ap0" //"wifi_ap0"        //"wifi_ap6"
#define PASSWORD    "hu1huone@" //"hu1huone@"       //"h123456."
#define HOST_NAME   "192.168.124.23" //"192.168.124.23"  //"192.168.0.151"
#define HOST_PORT   3081

char* httpReq = "GET /tempescope/effect HTTP/1.1\r\nHost: 192.168.124.23\r\nConnection: close\r\n\r\n";

void setupLog();
void printLog(char* msg, bool newline = true);
void printLogN(char* msg, uint32_t len);

uint32_t parseHexStr(const char* str, uint8_t digit);

#define CNT_PARSER  6
typedef uint32_t (*parser_t)(void*);
uint32_t parseColor(void* msg);
uint32_t parseBrightness(void* msg);
uint32_t parsePump(void* msg);
uint32_t parseHumidifier(void* msg);
uint32_t parseDelay(void* msg);
uint32_t parseRepeat(void* msg);

struct ParserMap 
{
  char idChar;
  parser_t parser;
} parserMap[CNT_PARSER] = 
{
  {'C', parseColor},
  {'B', parseBrightness},
  {'P', parsePump},
  {'H', parseHumidifier},
  {'D', parseDelay},
  {'R', parseRepeat}
};

bool wifiReady = false;

uint8_t effectRepeat = 0;
uint8_t buffer[450] = {0,};

Adafruit_NeoPixel strip(CNT_LED, PIN_LED, NEO_GRB + NEO_KHZ800);
SoftwareSerial wifiSerial(11, 10); //RX 11, TX 10
ESP8266 wifi(wifiSerial);

void setup(void)  
{
  setupLog();
  printLog("===== Begin Setup =====");
  
  pinMode(PIN_HUMI, OUTPUT);
  pinMode(PIN_PUMP, OUTPUT);
  
  strip.begin();

  for (uint8_t i = 0; i < CNT_LED; i++)
  {
    strip.setBrightness(64);
    strip.setPixelColor(i, 0xFF, 0xFF, 0xFF);
    strip.show();
    
    printLog(".", false);
    delay(80);
  }
  
  printLog("\r\nBegin WiFi Setting");  
  
  printLog(" - FW Version:", false);  
  printLog(wifi.getVersion().c_str());  
  
  if (wifi.setOprToStation())
  {  
    printLog(" - To station OK");
  } 
  else 
  {  
    printLog(" - To station ERROR");  
  }  
  
  if (wifi.joinAP(SSID, PASSWORD)) 
  {  
    printLog(" - Join AP success");  
    printLog(" - IP : [", false);
    printLog( wifi.getLocalIP().c_str(), false);
    printLog("]"); 
    
    wifiReady = true;     
  } 
  else 
  {  
    printLog(" - Join AP failure");  
  }  
  
  if (wifi.disableMUX()) 
  {  
    printLog(" - Single mode OK");  
  } 
  else 
  { 
    printLog(" - Single mode ERROR");  
  }  
  
  printLog("===== Setup End =====");  
}  

void loop(void)  
{ 
  char* msg = NULL;
  int32_t len = 0, i;
  uint8_t done = 0;

  if (wifiReady)
  {
    if (wifi.createTCP(HOST_NAME, HOST_PORT)) 
    { 
      printLog("Create TCP OK");  
      wifi.send(httpReq, strlen(httpReq));
      
      len = wifi.recv(buffer, sizeof(buffer) - 1, 1000);
      buffer[len - 1] = 0;
      
      if (len > 0) 
      {
        printLog("Received:[", false);
        printLogN((char*)buffer, (uint32_t)len);
        printLog("]");
        
        msg = strstr((char*)buffer, "<act>") + 5;

        if(msg != NULL)
        {
          len = (int32_t)(strstr((char*)msg, "</act>") - msg);
          
          if (len > 0)
          {
            do
            {
              i = 0;
              
              while (i < len)
              {
                for (uint8_t j = 0; j < CNT_PARSER; j++)
                {
                  if (msg[i] == parserMap[j].idChar)
                  {
                    i += parserMap[j].parser((void*)&msg[i + 1]);
                    break;
                  }
                }
                i++;
              }
              done++;
            } while (effectRepeat - (done - 1) > 0);
          }
        }
      }
      
      wifi.releaseTCP();
    } 
    else 
    {  
      printLog("Create TCP ERROR");
    }
  }
    
    delay(10000);
} 

void setupLog()
{
#ifdef LOG_SERIAL
  Serial.begin(9600);
#endif
}

void printLog(char* msg, bool newline = true)
{
#ifdef LOG_SERIAL
  Serial.print(msg);
  if (newline)
  {
    Serial.print("\r\n");
  }
#endif
}

void printLogN(char* msg, uint32_t len)
{
#ifdef LOG_SERIAL
  for (uint32_t i = 0; i < len; i++)
  {
    Serial.print((char)msg[i]);
  }
#endif
}

uint32_t parseHexStr(const char** str, uint8_t digit)
{
  uint32_t c, m, v = 0;
  float e = 0.01f;
  
  for (uint8_t i = 0; i < digit; i++)
  {
    c = (*str)[i];
    m = (uint32_t)(pow(2, 4 * (digit - 1 - i)) + e);
    
    if (c >= '0' && c <= '9')
    {
      v += (c - '0') *  m;
    }
    else if (c >= 'A' && c <= 'F')
    {
      v += ((c - 'A') + 10) * m;
    }
  }

  (*str) += 2;
  
  return v;
}

uint32_t parseColor(void* msg)
{
  static uint8_t LEN_MSG = 10;
  
  const char* p = (const char*)msg;
  uint8_t r = (uint8_t)parseHexStr(&p, 2);
  uint8_t g = (uint8_t)parseHexStr(&p, 2);
  uint8_t b = (uint8_t)parseHexStr(&p, 2);
  uint8_t s = (uint8_t)parseHexStr(&p, 2);
  uint8_t c = (uint8_t)parseHexStr(&p, 2);

  printLog("parseColor()");

  for (uint8_t i = 0; i < c; i++)
  {
    strip.setPixelColor(i + s, r, g, b);
  }
  
  strip.show();

  return LEN_MSG;
}

uint32_t parseBrightness(void* msg)
{
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  printLog("parseBrightness()");
  
  strip.setBrightness(v);
  strip.show();

  return LEN_MSG;
}

uint32_t parsePump(void* msg)
{
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  printLog("parsePump()");
  
  digitalWrite(PIN_PUMP, v > 0 ? HIGH : LOW);

  return LEN_MSG;
}

uint32_t parseHumidifier(void* msg)
{
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  printLog("parseHumidifier()");

  digitalWrite(PIN_HUMI, v > 0 ? HIGH : LOW);
  
  return LEN_MSG;
}

uint32_t parseDelay(void* msg)
{
  static uint8_t LEN_MSG = 4;
  
  const char* p = (const char*)msg;
  uint16_t v = (uint16_t)parseHexStr(&p, 4);

  printLog("parseDelay()");

  delay(v * 10);
  
  return LEN_MSG;
}

uint32_t parseRepeat(void* msg)
{
  static uint8_t LEN_MSG = 2;
  
  const char* p = (const char*)msg;
  uint8_t v = (uint8_t)parseHexStr(&p, 2);

  printLog("parseRepeat()");

  effectRepeat = v;
  
  return LEN_MSG;
}


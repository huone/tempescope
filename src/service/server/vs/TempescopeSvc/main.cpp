#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <string.h>

#include <winsock2.h>
#include <Windows.h>
#include <process.h>

#include "Tempescope.h"

#pragma comment(lib, "Ws2_32.lib")

using namespace hu1;

Tempescope* tempescope = NULL;

HANDLE tempescopeServerThread, appServerThread, httpClientThread;
DWORD tempescopeServerThreadID, appServerThreadID, httpClientThreadID;

HANDLE sendEvent;

bool quit = false;
char tsBuffer[512] = { 0, };
char appDest[512] = { 0, };
char httpBuffer[512] = { 0, };
char keyBuffer[512] = { 0, };
char* effect = NULL;

char* effectOff = "B00P00H00";
char* effectFine = "BA0CFFFFFF003CP00H00";
char* effectRain = "B40CFF0000003CP01H01";
char* effectCloudy = "B20C0000FF003CP00H01";
char* effectDemo = "CFFFFFF003CH01D02BCH00P01CFF00FF000FD0064C0000FF0F0FD0064CFFFF001E0FD0064C00FFFF2D0FP00D01F4CFFFFFF003CB10D0005B20D0005B30D0005B40D0005B50D0005B60D0005B70D0005B80D0005B90D0005BA0D0005B90D0005B80D0005B70D0005B60D0005B50D0005B40D0005B30D0005B20D0005R02";

void ErrorHandling(char *message)
{
   fputs(message, stderr);
   fputc('\n', stderr);
   exit(1);
}

DWORD WINAPI TempescopeServerMain(LPVOID param)
{
   SOCKET hServSock;
   SOCKET hClntSock;
   SOCKADDR_IN servAddr;
   SOCKADDR_IN clntAddr;
   int szClntAddr;
   int strLen;

   hServSock = socket(PF_INET, SOCK_STREAM, 0);
   if (hServSock == INVALID_SOCKET)
   {
      ErrorHandling("socket() error");
   }

   memset(&servAddr, 0, sizeof(servAddr));
   servAddr.sin_family = AF_INET;
   servAddr.sin_addr.s_addr = htonl(INADDR_ANY);
   servAddr.sin_port = htons(3081);

   if (bind(hServSock, (SOCKADDR*)&servAddr, sizeof(servAddr)) == SOCKET_ERROR)
   {
      ErrorHandling("bind() error");
   }

   if (listen(hServSock, 5) == SOCKET_ERROR)
   {
      ErrorHandling("listen() error");
   }

   szClntAddr = sizeof(clntAddr);
   hClntSock = accept(hServSock, (SOCKADDR*)&clntAddr, &szClntAddr);
   if (hClntSock == INVALID_SOCKET)
   {
      ErrorHandling("accept() error");
   }

   tempescope = new Tempescope(hClntSock, 1024);

   while (!quit)
   {
      strLen = recv(hClntSock, tsBuffer, sizeof(tsBuffer) - 1, 0);
      if (strLen == -1)
      {
         ErrorHandling("read() error");
      }

      tsBuffer[strLen] = 0;

      //printf("Message from tempescope : %s \n", tsBuffer);

      if (strLen == 4)
      {
         int msgNo = atoi(tsBuffer);

         switch (msgNo)
         {
            case 1 :
               printf("Tempescope client is connected\r\n");
               break;

            case 2 :
               if (effect == NULL)
               {
                  WaitForSingleObject(sendEvent, INFINITE);
               }

               ResetEvent(sendEvent);

               if (effect != NULL)
               {
                  tempescope->SendEffect((uint8*)effect, strlen(effect));
                  effect = NULL;
               }
               else
               {
                  printf("ERROR : Effect is NULL");
               }
               break;

            default:
               break;
         }
      }
   }

   tempescope = NULL;
   closesocket(hClntSock);

   return 1;
}

DWORD WINAPI AppServerMain(LPVOID param)
{
   SOCKET hServSock;
   SOCKET hClntSock;
   SOCKADDR_IN servAddr;
   SOCKADDR_IN clntAddr;
   int szClntAddr;
   int strLen;

   hServSock = socket(PF_INET, SOCK_STREAM, 0);
   if (hServSock == INVALID_SOCKET)
   {
      ErrorHandling("socket() error");
   }

   memset(&servAddr, 0, sizeof(servAddr));
   servAddr.sin_family = AF_INET;
   servAddr.sin_addr.s_addr = htonl(INADDR_ANY);
   servAddr.sin_port = htons(82);

   if (bind(hServSock, (SOCKADDR*)&servAddr, sizeof(servAddr)) == SOCKET_ERROR)
   {
      ErrorHandling("bind() error");
   }

   printf("Tempescope server is started\r\n");

   if (listen(hServSock, 5) == SOCKET_ERROR)
   {
      ErrorHandling("listen() error");
   }

   szClntAddr = sizeof(clntAddr);
   hClntSock = accept(hServSock, (SOCKADDR*)&clntAddr, &szClntAddr);
   if (hClntSock == INVALID_SOCKET)
   {
      ErrorHandling("accept() error");
   }

   while (!quit)
   {
      strLen = recv(hClntSock, appDest, sizeof(appDest)-1, 0);
      if (strLen == -1)
      {
         ErrorHandling("read() error");
      }

      appDest[strLen] = 0;

      if (strLen == 4)
      {
         int msgNo = atoi(appDest);

         switch (msgNo)
         {
         case 1:
            printf("App. client is connected\r\n");
            break;

         case 1001:
            effect = effectFine;
            SetEvent(sendEvent);
            break;

         case 1101:
            effect = effectRain;
            SetEvent(sendEvent);
            break;

         case 1201:
            effect = effectCloudy;
            SetEvent(sendEvent);
            break;

         case 9001:
            effect = effectDemo;
            SetEvent(sendEvent);
            break;

         default:
            //printf("Recieved effect : %s\n", appDest);
            break;
         }
      }
   }

   closesocket(hClntSock);

   return 1;
}

char* httpReq[] = {
   "GET /tempescope/set/effect?code=9001 HTTP/1.1\r\n",
   "Host: 127.0.0.1\r\n",
   "Connection: close\r\n\r\n"
};

char* ip = "127.0.0.1";

DWORD WINAPI HttpClientMain(LPVOID param)
{
   SOCKET hClntSock;
   SOCKADDR_IN servAddr;
   struct hostent *server;
   int szClntAddr;
   int strLen;

   hClntSock = socket(PF_INET, SOCK_STREAM, 0);
   if (hClntSock == INVALID_SOCKET)
   {
      ErrorHandling("socket() error");
   }

   memset(&servAddr, 0, sizeof(servAddr));
   servAddr.sin_family = AF_INET;
   servAddr.sin_addr.s_addr = inet_addr(ip);//htonl(INADDR_ANY);
   servAddr.sin_port = htons(3081);


   if (connect(hClntSock, (SOCKADDR*)&servAddr, sizeof(servAddr)) == SOCKET_ERROR)
   {
      ErrorHandling("connect() error");
   }

   for (uint8 i = 0; i < 3; i++)
   {
      strLen = send(hClntSock, httpReq[i], strlen(httpReq[i]), 0);
      if (strLen < 0)
      {
         ErrorHandling("send() error");
      }
   }

   strLen = recv(hClntSock, httpBuffer, sizeof(httpBuffer)-1, 0);

   if (strLen == -1)
   {
      ErrorHandling("read() error");
   }

   printf("http client received :\n%s\n", httpBuffer);

   closesocket(hClntSock);

   return 1;
}

int main(int argc, char** argv)
{
   WSADATA wsaData;

   // Load Winsock 2.2 DLL
   if (WSAStartup(MAKEWORD(2, 2), &wsaData) != 0)
   {
      ErrorHandling("WSAStartup() error!");
   }

   tempescopeServerThread = CreateThread(NULL, 0, TempescopeServerMain, NULL, CREATE_SUSPENDED, &tempescopeServerThreadID);
   SetThreadPriority(tempescopeServerThread, THREAD_PRIORITY_NORMAL);
   ResumeThread(tempescopeServerThread);

   //appServerThread = CreateThread(NULL, 0, AppServerMain, NULL, CREATE_SUSPENDED, &appServerThreadID);
   //SetThreadPriority(appServerThread, THREAD_PRIORITY_NORMAL);
   //ResumeThread(appServerThread);

   //httpClientThread = CreateThread(NULL, 0, HttpClientMain, NULL, CREATE_SUSPENDED, &httpClientThreadID);
   //SetThreadPriority(httpClientThread, THREAD_PRIORITY_NORMAL);
   //ResumeThread(httpClientThread);

   while (!quit)
   {
      //printf("> ");
      scanf_s("%s", keyBuffer, sizeof(keyBuffer));

      if (strcmp(keyBuffer, "q") == 0)
      {
         quit = true;
         effect = effectOff;
         SetEvent(sendEvent);
      }
      else if (strncmp(keyBuffer, "put led color", 13) == 0)
      {
         //TODO
      }
      else if (strncmp(keyBuffer, "put brightness", 14) == 0)
      {
         if (tempescope != NULL)
         {
            tempescope->PutLedBrightness((uint8)atoi(keyBuffer + 15));
         }
      }
      else if (strncmp(keyBuffer, "put pump power", 14) == 0)
      {
         if (tempescope != NULL)
         {
            tempescope->PutPump((uint8)atoi(keyBuffer + 15));
         }
      }
      else if (strncmp(keyBuffer, "put humi power", 14) == 0)
      {
         if (tempescope != NULL)
         {
            tempescope->PutHumidifier((uint8)atoi(keyBuffer + 15));
         }
      }
      else if (strncmp(keyBuffer, "put delay", 9) == 0)
      {
         if (tempescope != NULL)
         {
            tempescope->PutPump((uint8)atoi(keyBuffer + 10));
         }
      }
      else if (strncmp(keyBuffer, "send", 4) == 0)
      {
         if (tempescope != NULL)
         {
            tempescope->Send();
            SetEvent(sendEvent);
         }
      }
      else
      {
         effect = keyBuffer;
         SetEvent(sendEvent);
      }
   }

   printf("Server finishing ");
   for (int i = 0; i < 3; i++)
   {
      printf(".");
      Sleep(1000);
   }

   WSACleanup();

   return 1;
}
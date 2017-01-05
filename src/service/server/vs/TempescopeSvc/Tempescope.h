#pragma once

#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <string.h>
#include <winsock2.h>

#include "./types.h"

namespace hu1 {
   class Tempescope {
   private:
      uint8* pBuffer;
      uint8* pDest;
      SOCKET hSocket;
      void sendToClient(uint8* effect, uint16 len);

   public:
      Tempescope(SOCKET hSocket, uint32 szBuffer);
      ~Tempescope();

      void SendEffect(uint8* effect, uint16 len);

      void PutLedColors(uint8 r, uint8 g, uint8 b, uint8 idxStart, uint8 count);
      void PutLedBrightness(uint8 bright);
      void PutPump(uint8 power);
      void PutHumidifier(uint8 power);
      void PutDelay(uint16 time);

      void Send();
   };
};
#include "./Tempescope.h"

hu1::Tempescope::Tempescope(SOCKET hSocket, uint32 szBuffer) : hSocket(hSocket)
{
   pBuffer = new uint8[szBuffer];
   pDest = pBuffer;
}

hu1::Tempescope::~Tempescope()
{
   delete pDest;
}

void hu1::Tempescope::sendToClient(uint8* effect, uint16 len)
{
   send(hSocket, (const char*)effect, len, 0);
}

void hu1::Tempescope::SendEffect(uint8* effect, uint16 len)
{
   sendToClient(effect, len);
}

void hu1::Tempescope::PutLedColors(uint8 r, uint8 g, uint8 b, uint8 idxStart, uint8 count)
{
   *(pDest++) = 'C';
   sprintf((char*)pDest, "%2x%2x%2x%2x%2x", r, g, b, idxStart, count);
   pDest += 10;
}

void hu1::Tempescope::PutLedBrightness(uint8 bright)
{
   *(pDest++) = 'B';
   sprintf((char*)pDest, "%2x", bright);
   pDest += 2;
}

void hu1::Tempescope::PutPump(uint8 power)
{
   *(pDest++) = 'P';
   sprintf((char*)pDest, "%2x", power);
   pDest += 2;
}

void hu1::Tempescope::PutHumidifier(uint8 power)
{
   *(pDest++) = 'H';
   sprintf((char*)pDest, "%2x", power);
   pDest += 2;
}

void hu1::Tempescope::PutDelay(uint16 time)
{
   *(pDest++) = 'D';
   sprintf((char*)pDest, "%4x", time);
   pDest += 4;
}

void hu1::Tempescope::Send()
{
   uint32 len = pDest - pBuffer;
   if (len > 0)
   {
      send(hSocket, (const char*)pDest, len, 0);
   }

   pDest = pBuffer;
}

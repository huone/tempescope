package tempescope.hu1.com.tempescope;

import android.util.Log;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.net.InetAddress;
import java.net.Socket;

/**
 * Created by swlim on 2016-12-29.
 */

public class TempescopeTCPClient implements Runnable {
    public static final String SERVERIP = "192.168.124.23"; //"192.168.0.151"; //"192.168.124.23";
    public static final int SERVERPORT = 82;

    private String effectMsg = null;
    private boolean quit = false;

    private Socket socket = null;

    private BufferedReader networkReader;
    private BufferedWriter networkWriter;

    @Override
    public void run() {
        try {
            InetAddress serverAddr = InetAddress.getByName(SERVERIP);

            socket = new Socket(serverAddr, SERVERPORT);
            try {
                networkWriter = new BufferedWriter(new OutputStreamWriter(socket.getOutputStream()));
                networkReader = new BufferedReader(new InputStreamReader(socket.getInputStream()));

                networkWriter.write("0001");
                networkWriter.flush();

                while (!quit) {
                    if(effectMsg != null)
                    {
                        networkWriter.write(effectMsg);
                        networkWriter.flush();
                        effectMsg = null;
                    }
                }
            } catch(Exception e) {
                Log.e("TCP", "S: Error", e);
            } finally {
                if (networkWriter != null) {
                    try {
                        networkWriter.close();
                        networkWriter = null;
                    } catch (Exception e) {
                        Log.e("TCP", "C: Error", e);
                    }
                }

                if (networkReader != null) {
                    try {
                        networkReader.close();
                        networkReader = null;
                    } catch (Exception e) {
                        Log.e("TCP", "C: Error", e);
                    }
                }

                if (socket != null) {
                    try {
                        socket.close();
                        socket = null;
                    } catch (Exception e) {
                        Log.e("TCP", "C: Error", e);
                    }
                }
            }
        } catch (Exception e) {
            Log.e("TCP", "C: Error", e);
        }
    }

    public void setEffectMessage(String msg)
    {
        effectMsg = msg;
    }

    public void finish() {
        quit = true;
    }
}

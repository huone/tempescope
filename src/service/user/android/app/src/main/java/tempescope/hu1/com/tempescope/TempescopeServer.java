package tempescope.hu1.com.tempescope;

import java.io.IOException;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

/**
 * Created by swlim on 2017-01-06.
 */

public class TempescopeServer {
    public static final String SERVERIP = "192.168.124.23"; //"192.168.0.151"; //"192.168.124.23";
    public static final int SERVERPORT = 3081;
    public static final String SERVER_API = "tempescope/set/effect";

    public static final String BASE_URL = SERVERIP +":" + SERVERPORT + "/" + SERVER_API + "?";

    public void sendEffectCode(String effectCode)
    {
        URL url = null;
        try {
            url = new URL(BASE_URL + "code=" + effectCode);
            HttpURLConnection httpConn = (HttpURLConnection) url.openConnection();

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}

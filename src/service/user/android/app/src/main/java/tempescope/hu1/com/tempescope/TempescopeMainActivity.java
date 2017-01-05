package tempescope.hu1.com.tempescope;

import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.view.View;
import android.view.Menu;
import android.view.MenuItem;
import android.widget.Button;
import android.widget.TextView;

public class TempescopeMainActivity extends AppCompatActivity {

    private TempescopeTCPClient tempescopeTCPClient;

    private TextView txt1;
    private Button btnConn, btnDisconn, btnFine, btnRain, btnCloudy, btnDemo;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_tempescope_main);
        Toolbar toolbar = (Toolbar) findViewById(R.id.toolbar);
        setSupportActionBar(toolbar);

        txt1 = (TextView) findViewById(R.id.textView);
        txt1.setText("Disconnect");

        btnConn = (Button) findViewById(R.id.btnConn);
        btnConn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tempescopeTCPClient = new TempescopeTCPClient();
                Thread cThread = new Thread(tempescopeTCPClient);
                cThread.start();

                txt1.setText("Connect");
            }
        });

        btnDisconn = (Button) findViewById(R.id.btnDisconn);
        btnDisconn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (tempescopeTCPClient != null) {
                    tempescopeTCPClient.finish();
                    tempescopeTCPClient = null;
                }

                txt1.setText("Disconnected");
            }
        });

        btnFine = (Button) findViewById(R.id.btnFine);
        btnFine.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tempescopeTCPClient.setEffectMessage("1001");
                txt1.setText("Fine");
            }
        });

        btnRain = (Button) findViewById(R.id.btnRain);
        btnRain.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tempescopeTCPClient.setEffectMessage("1101");
                txt1.setText("Rain");
            }
        });

        btnCloudy = (Button) findViewById(R.id.btnCloudy);
        btnCloudy.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tempescopeTCPClient.setEffectMessage("1201");
                txt1.setText("Cloudy");
            }
        });

        btnDemo = (Button) findViewById(R.id.btnDemo);
        btnDemo.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                tempescopeTCPClient.setEffectMessage("9000");
                txt1.setText("Demo");
            }
        });
    }

    @Override
    protected void onStop() {
        super.onStop();

        if (tempescopeTCPClient != null) {
            tempescopeTCPClient.finish();
            tempescopeTCPClient = null;
        }

        txt1.setText("Disconnect");
    }

    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        // Inflate the menu; this adds items to the action bar if it is present.
        getMenuInflater().inflate(R.menu.menu_tempescope_main, menu);
        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        // Handle action bar item clicks here. The action bar will
        // automatically handle clicks on the Home/Up button, so long
        // as you specify a parent activity in AndroidManifest.xml.
        int id = item.getItemId();

        //noinspection SimplifiableIfStatement
        if (id == R.id.action_settings) {
            return true;
        }

        return super.onOptionsItemSelected(item);
    }
}

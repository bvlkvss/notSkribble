package com.example.client_leger

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import org.json.JSONArray
import org.json.JSONObject

class ProfileListAdapter2(private val context: Activity, private val data: ArrayList<JSONObject>) :
    ArrayAdapter<JSONObject>(context, R.layout.profile_table2, data) {

    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        val inflater = context.layoutInflater
        var rowView = inflater.inflate(R.layout.profile_table2, null, true)


        val mode = rowView.findViewById(R.id.data1) as TextView
        val date = rowView.findViewById(R.id.data2) as TextView
        val time = rowView.findViewById(R.id.data3) as TextView
        val result = rowView.findViewById(R.id.data5) as TextView
        val player1 = rowView.findViewById(R.id.play1) as TextView
        val player2 = rowView.findViewById(R.id.play2) as TextView
        val player3 = rowView.findViewById(R.id.play3) as TextView
        val player4 = rowView.findViewById(R.id.play4) as TextView

        mode.text = ""
        date.text = ""
        time.text = ""
        result.text = ""
        player1.text = ""
        player1.visibility = View.GONE
        player2.text = ""
        player2.visibility = View.GONE
        player3.text = ""
        player3.visibility = View.GONE
        player4.text = ""
        player4.visibility = View.GONE

        val timeStamp = data[position]["timestamp"] as JSONObject
        val playDate = timeStamp["date"] as JSONObject
        val playTime = timeStamp["time"] as JSONObject
        val players = data[position]["players"] as JSONArray
        mode.text = data[position]["game_mode"].toString()
        date.text = "${playDate["day"]}-${playDate["month"]}-${playDate["year"]}"
        time.text = "${playTime["hour"]}:${playTime["minute"]}:${playTime["second"]}"
        result.text = data[position]["result"].toString()
        player1.visibility = View.VISIBLE
        player1.text = players[0].toString()
        if (players.length() > 1) {
            player2.visibility = View.VISIBLE
            player2.text = players[1].toString()
            if (players.length() > 2) {
                player3.visibility = View.VISIBLE
                player3.text = players[2].toString()
                if (players.length() > 3) {
                    player4.visibility = View.VISIBLE
                    player4.text = players[3].toString()
                }
            }
        }
        return rowView
    }
}
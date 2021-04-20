package com.example.client_leger

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import org.json.JSONObject

class ProfileListAdapter(
    private val context: Activity, private val loginData: ArrayList<JSONObject>,
    private val logoutData: ArrayList<JSONObject>
) : ArrayAdapter<JSONObject>(context, R.layout.profile_table1, loginData) {

    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        val inflater = context.layoutInflater
        var rowView = inflater.inflate(R.layout.profile_table1, null, true)


        val date1 = rowView.findViewById(R.id.date1) as TextView
        val time1 = rowView.findViewById(R.id.time1) as TextView
        val date2 = rowView.findViewById(R.id.date2) as TextView
        val time2 = rowView.findViewById(R.id.time2) as TextView

        date1.text = ""
        time1.text = ""
        date2.text = ""
        time2.text = ""

        val loginDate = loginData[position]["date"] as JSONObject
        val loginTime = loginData[position]["time"] as JSONObject
        date1.text = "${loginDate["day"]}-${loginDate["month"]}-${loginDate["year"]}"
        time1.text = "${loginTime["hour"]}:${loginTime["minute"]}:${loginTime["second"]}"

        if (position < logoutData.size) {
            val logoutDate = logoutData[position]["date"] as JSONObject
            val logoutTime = logoutData[position]["time"] as JSONObject
            date2.text = "${logoutDate["day"]}-${logoutDate["month"]}-${logoutDate["year"]}"
            time2.text = "${logoutTime["hour"]}:${logoutTime["minute"]}:${logoutTime["second"]}"
        }


        return rowView
    }
}
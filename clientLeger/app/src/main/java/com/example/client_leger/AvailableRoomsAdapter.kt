package com.example.client_leger

import android.app.Activity
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.TextView
import org.json.JSONArray

class AvailableRoomsAdapter(
    private val context: Activity,
    private val rooms: ArrayList<String>,
    private val number: HashMap<String, JSONArray>
) : ArrayAdapter<String>(context, R.layout.available_gamerooms, rooms) {

    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        val inflater = context.layoutInflater
        var rowView = inflater.inflate(R.layout.available_gamerooms, null, true)

        val titleText = rowView.findViewById(R.id.roomName) as TextView
        val numberText1 = rowView.findViewById(R.id.number1) as TextView
        val numberText2 = rowView.findViewById(R.id.number2) as TextView
        val numberText3 = rowView.findViewById(R.id.number3) as TextView
        val numberText4 = rowView.findViewById(R.id.number4) as TextView

        numberText1.text = ""
        numberText2.text = ""
        numberText3.text = ""
        numberText4.text = ""

        titleText.text = rooms[position]
        if (number.containsKey(rooms[position])) {
            val room = number[rooms[position]] as JSONArray
            numberText1.text = "${room.get(0)}"
            if (room.length() > 1) {
                numberText2.text = "${room.get(1)}"
                if (room.length() > 2) {
                    numberText3.text = "${room.get(2)}"
                    if (room.length() > 3) {
                        numberText4.text = "${room.get(3)}"
                    }
                }
            }

        }
        return rowView
    }
}
package com.example.client_leger

import android.app.Activity
import android.graphics.Typeface
import android.view.View
import android.view.ViewGroup
import android.widget.ArrayAdapter
import android.widget.ImageView
import android.widget.TextView

class ListViewAdapter(
    private val context: Activity, private val rooms: ArrayList<String>,
    private val isNotify: HashMap<String, Boolean>, private val isActive: Boolean
) : ArrayAdapter<String>(context, R.layout.chatrooms_list, rooms) {

    override fun getView(position: Int, view: View?, parent: ViewGroup): View {
        val inflater = context.layoutInflater
        var rowView = inflater.inflate(R.layout.chatrooms_list, null, true)

        val titleText = rowView.findViewById(R.id.roomName) as TextView
        val imageView = rowView.findViewById(R.id.notifIcon) as ImageView

        titleText.text = rooms[position]
        titleText.typeface = Typeface.DEFAULT
        if (isActive) {
            imageView.setImageDrawable(null)
            if (isNotify.containsKey(rooms[position])) {
                if (isNotify[rooms[position]]!!) {
                    titleText.typeface = Typeface.DEFAULT_BOLD
                    imageView.setImageResource(R.drawable.notification)
                }
            }
        }
        return rowView
    }
}
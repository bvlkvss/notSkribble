package com.example.client_leger

import android.app.AlertDialog
import android.content.DialogInterface
import android.media.MediaPlayer
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import androidx.core.view.get
import androidx.core.view.size
import androidx.fragment.app.Fragment
import io.socket.emitter.Emitter
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList
import kotlin.collections.HashMap


private const val ACTIVE = "active"
private const val JOIN = "join"

class RoomsChatFragment : Fragment() {

    var mSocket = SocketInstance.getMSocket()
    private lateinit var messageComp: EditText
    private lateinit var messagesList: ListView
    private lateinit var roomsList: ListView
    private lateinit var joinList: ListView
    private lateinit var activeTab: TextView
    private lateinit var joinTab: TextView
    private lateinit var createTab: TextView
    private lateinit var fragTitle: TextView
    private lateinit var header: ConstraintLayout
    private lateinit var createChatRoom: ConstraintLayout
    private lateinit var chatRoom: ConstraintLayout
    private lateinit var chatRoomConst: ConstraintLayout
    private lateinit var refreshJoin: ConstraintLayout



    private lateinit var moreOptionsButton: ImageView
    private lateinit var createRoomButton: Button
    private lateinit var hintButton: Button
    private lateinit var createRoomText: EditText
    private var joinedPosition: Int = 0
    private var roomsToJoin = ArrayList<String>(2)
    private var rooms = ArrayList<String>(2)
    private var currentConvo = ArrayList<String>(2)
    var array = ArrayList<TextView>(2)
    var roomTitle = ""
    private lateinit var title: TextView
    private var isHistoryMessage = false


    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {

        var v = inflater.inflate(R.layout.fragment_rooms_chat, container, false)

        roomsList = v.findViewById<ListView>(R.id.roomsList)
        joinList = v.findViewById<ListView>(R.id.joinList)
        chatRoom = v.findViewById<ConstraintLayout>(R.id.chatRoom)
        chatRoomConst = v.findViewById<ConstraintLayout>(R.id.chatRoomConst)
        messageComp = v.findViewById<EditText>(R.id.etmessageinput)
        messagesList = v.findViewById<ListView>(R.id.messages)
        activeTab = v.findViewById(R.id.tvactive)
        joinTab = v.findViewById(R.id.tvjoin)
        createTab = v.findViewById(R.id.tvcreate)
        header = v.findViewById(R.id.header)
        fragTitle = v.findViewById(R.id.chattitle)
        createChatRoom = v.findViewById(R.id.clcreateroom)
        array = arrayListOf(activeTab, joinTab, createTab)
        createRoomButton = v.findViewById<Button>(R.id.createRoomButton)
        createRoomText = v.findViewById<EditText>(R.id.etcreateroom)
        moreOptionsButton = v.findViewById(R.id.moreOptions)
        title = v.findViewById<TextView>(R.id.tvroomtitle)
        hintButton = v.findViewById(R.id.hint)
        refreshJoin = v.findViewById(R.id.cljoin)

        var data = JSONObject()

        changeTheme()

        offListeners()
        messageComp.setOnKeyListener { v, keyCode, event ->

            when {
                ((keyCode == KeyEvent.KEYCODE_ENTER) && (event.action == KeyEvent.ACTION_DOWN)) -> {
                    sendMessage(roomTitle)
                    return@setOnKeyListener true
                }
                else -> true
            }
        }


        roomsList.setOnItemClickListener { parent, view, position, id ->
            SocketInstance.isNotify[rooms[position]] = false
            openChat(position)
        }

        v.findViewById<Button>(R.id.refreshJoinButton).setOnClickListener {
            mSocket?.emit("all_chatrooms", data)
        }

        joinList.setOnItemClickListener { parent, view, position, id ->
            activity!!.runOnUiThread {
                joinList[position].isEnabled = false
                var data = JSONObject()
                data.put("username", SocketInstance.username)
                data.put("room", roomsToJoin[position])
                roomsToJoin.removeAt(position)
                mSocket?.emit("join_chatroom", data)
                joinedPosition = position
            }
        }

        v.findViewById<Button>(R.id.backArrow).setOnClickListener {
            goBack()
        }

        activeTab.setOnClickListener {
            mSocket?.emit("connected_chatrooms", data)
            roomsList.visibility = View.VISIBLE
            refreshJoin.visibility = View.GONE
            createChatRoom.visibility = View.GONE
            setCurrentTab(activeTab)
            changeTab(ACTIVE)
        }

        joinTab.setOnClickListener {
            mSocket?.emit("all_chatrooms", data)
            refreshJoin.visibility = View.VISIBLE
            roomsList.visibility = View.GONE
            createChatRoom.visibility = View.GONE
            setCurrentTab(joinTab)
            changeTab(JOIN)
        }


        createTab.setOnClickListener {
            createChatRoom.visibility = View.VISIBLE
            refreshJoin.visibility = View.GONE
            roomsList.visibility = View.GONE
            setCurrentTab(createTab)
        }

        v.findViewById<ImageButton>(R.id.send).setOnClickListener {
            sendMessage(roomTitle)
        }

        hintButton.setOnClickListener {
            var dataName = JSONObject()
            dataName.put("name", SocketInstance.roomName)
            mSocket?.emit("get_hint", dataName)
        }

        createRoomText.afterTextChanged { }
        createRoomButton.setOnClickListener {
            var data = JSONObject()
            data.put("username", SocketInstance.username)
            data.put("room", createRoomText.text.toString())
            if (roomsToJoin.contains(createRoomText.text.toString()) || rooms.contains(
                    createRoomText.text.toString()
                )
            ) {
                showDialog(3)
            } else {
                showDialog(2)
                mSocket?.emit("join_chatroom", data)
                mSocket?.emit("connected_chatrooms", data)
            }
            createRoomText.text.clear()
        }

        moreOptionsButton.setOnClickListener { v ->
            val popup = PopupMenu(activity, v)
            popup.menuInflater.inflate(R.menu.more_options_menu, popup.menu)
            popup.setOnMenuItemClickListener { item ->
                when (item.itemId) {
                    R.id.quitRoom -> showDialog(1)
                    else -> {
                    }
                }
                false
            }
            popup.show()
        }

        v.findViewById<Button>(R.id.messageHistory).setOnClickListener {
            isHistoryMessage = true
            var data = JSONObject()
            data.put("room", roomTitle)
            mSocket?.emit("chatroom_logs", data)
        }

        mSocket?.emit("connected_chatrooms", data)
        mSocket?.emit("all_chatrooms", data)

        mSocket?.on("chatroom_message", onSendMessage)
        mSocket?.on("join_chatroom", onJoinChatroom)
        mSocket?.on("chatroom_logs", onChatroomLogs)
        mSocket?.on("all_chatrooms", onAllChatrooms)
        mSocket?.on("connected_chatrooms", onConnectedChatrooms)
        mSocket?.on("leave_chatroom", onLeaveChatroom)
        return v
    }

    fun openChat(position: Int) {
        roomTitle = rooms[position]
        roomsList.visibility = View.GONE
        chatRoom.visibility = View.VISIBLE
        header.visibility = View.GONE
        if (roomTitle == "general" || roomTitle.contains("[PRIV]")) {
            moreOptionsButton.visibility = View.GONE
        }
        hintButton.visibility = View.GONE
        if (roomTitle.contains("[PRIV]")) {
            hintButton.visibility = View.VISIBLE
        }
        title.text = roomTitle

        var data = JSONObject()
        data.put("room", roomTitle)
        mSocket?.emit("chatroom_logs", data)
    }

    private fun showDialog(code: Int) {
        val dialogBuilder = AlertDialog.Builder(context)
        if (code == 1) {
            var messageQuit = getString(R.string.quitPopup, roomTitle)
            dialogBuilder.setMessage(messageQuit)
            dialogBuilder.setPositiveButton(R.string.cancel,
                DialogInterface.OnClickListener { dialog, whichButton -> })
            dialogBuilder.setNegativeButton(R.string.quitButton,
                DialogInterface.OnClickListener { dialog, whichButton ->
                    var data = JSONObject()
                    data.put("room", roomTitle)
                    mSocket?.emit("leave_chatroom", data)
                })
        } else if (code == 2) {
            var messageCreateSuccess = R.string.createchatroomSuccess
            dialogBuilder.setMessage(messageCreateSuccess)
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton -> })
        } else if (code == 3) {
            var messageCreateFail = R.string.createchatroomFail
            dialogBuilder.setMessage(messageCreateFail)
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton -> })
        }
        val b = dialogBuilder.create()
        b.show()
    }

    private fun goBack() {
        currentConvo.clear()
        roomTitle = ""
        var adapter = ArrayAdapter(
            activity!!.baseContext,
            android.R.layout.simple_list_item_1,
            currentConvo
        )
        activity!!.runOnUiThread {
            messagesList.adapter = adapter
            roomsList.visibility = View.VISIBLE
            chatRoom.visibility = View.GONE
            header.visibility = View.VISIBLE
            moreOptionsButton.visibility = View.VISIBLE
        }
        changeTab(ACTIVE)
    }

    private fun setCurrentTab(clickedTab: TextView) {
        for (tab in array) {
            if (tab == clickedTab) {
                tab.background = ContextCompat.getDrawable(requireContext(), R.drawable.active_tab)
                tab.setTextColor(ContextCompat.getColor(requireContext(), R.color.purple_light))
            } else {
                tab.background =
                    ContextCompat.getDrawable(requireContext(), R.drawable.header_border)
                if (LocaleUtils.selectedThemeId == "light") {
                    tab.setTextColor(ContextCompat.getColor(requireContext(), R.color.black))
                } else {
                    tab.setTextColor(ContextCompat.getColor(requireContext(), R.color.white))
                }
            }
        }
    }

    private fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
        this.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val createtext = createRoomText.text.toString()
                createRoomButton.isEnabled = createtext.isNotBlank()
            }

            override fun afterTextChanged(editable: Editable?) {
                afterTextChanged.invoke(editable.toString())
            }
        })
    }

    private fun changeTab(tab: String) {
        if (tab == ACTIVE) {
            var adapter = ListViewAdapter(activity!!, rooms, SocketInstance.isNotify, true)
            adapter.notifyDataSetChanged()
            activity!!.runOnUiThread {
                roomsList.adapter = adapter
            }
        } else if (tab == JOIN) {
            var adapter = ListViewAdapter(activity!!, roomsToJoin, HashMap(), false)
            adapter.notifyDataSetChanged()
            activity!!.runOnUiThread {
                joinList.adapter = adapter
            }
        }
    }

    private var onJoinChatroom = Emitter.Listener { args ->
        try {
            var data = args[0] as JSONObject
            var code = data["code"] as Int
            if (code == 1) {
                changeTab(ACTIVE)
                changeTab(JOIN)
            } else {
                if (joinedPosition < joinList.size) {
                    joinList[joinedPosition].isEnabled = true
                }
            }
        } catch (e: JSONException) {
        }
    }

    private var onSendMessage = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            if (data.length() > 0) {
                var user = data["user"] as String
                var messageContent = data["message"] as String
                var timeStamp = data["timestamp"] as String
                var chatroom = data["chatroom"] as String
                var fullMessage = "$user: $messageContent   -- $timeStamp"
                if (chatroom == roomTitle) {
                    currentConvo.add(fullMessage)
                    updateMessages()
                }
                if (user != SocketInstance.username) {
                    SocketInstance.ring?.reset()
                    SocketInstance.ring = MediaPlayer.create(
                        activity,
                        resources.getIdentifier("notif_sound", "raw", activity!!.packageName)
                    )
                    SocketInstance.ring?.start()
                    notification(chatroom)
                }
            }
        } catch (e: JSONException) {
        }
    }

    private fun notification(roomName: String) {
        val index = rooms.indexOf(roomName)
        if (index != -1 && roomName != roomTitle) {
            SocketInstance.isNotify[rooms[index]] = true
            changeTab(ACTIVE)
        }
    }

    private var onChatroomLogs = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            if (data.length() > 0) {
                var logs = data["logs"] as JSONArray
                currentConvo.clear()

                for (i in 0 until logs.length()) {
                    val log = logs.get(i) as JSONObject
                    var user = log["user"]
                    var message = log["message"]
                    var timestamp = log["timestamp"]
                    var date = log["date_time"].toString()
                    val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.US)
                    val dateChat = dateFormat.parse(date)
                    val loginDate = dateFormat.parse(SocketInstance.timeStamp)
                    val timeDiff = dateChat.time - loginDate.time
                    var fullMessage = "$user: $message   -- $timestamp"

                    if (!isHistoryMessage) {
                        if (timeDiff >= 0) {
                            currentConvo.add(fullMessage)
                        }
                    } else {
                        currentConvo.add(fullMessage)
                    }
                }
                if (isHistoryMessage) {
                    isHistoryMessage = false
                }
                updateMessages()
            }
        } catch (e: JSONException) {
        }
    }

    private fun updateMessages() {
        var adapter = ListViewAdapter(activity!!, currentConvo, HashMap(), false)
        adapter.notifyDataSetChanged()
        activity!!.runOnUiThread {
            messagesList.adapter = adapter
        }
    }

    private var onAllChatrooms = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            if (data.length() > 0) {
                var availableRooms = data["rooms"] as JSONArray

                roomsToJoin.clear()

                for (i in 0 until availableRooms.length()) {
                    val room = availableRooms.get(i).toString()
                    if (!rooms.contains(room)) {
                        roomsToJoin.add(room)
                    }
                }
                changeTab(JOIN)
            }
        } catch (e: JSONException) {
        }
    }

    private var onConnectedChatrooms = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject

            if (data.length() > 0) {
                var currentRooms = data["rooms"] as JSONArray

                rooms.clear()

                for (i in 0 until currentRooms.length()) {
                    val room = currentRooms.get(i).toString()
                    if (room.contains("[PRIV]")) {
                        rooms.add(0, room)
                    } else {
                        rooms.add(room)
                    }
                    if (!SocketInstance.isNotify.containsKey(rooms[i])) {
                        SocketInstance.isNotify[rooms[i]] = false
                    }
                }
                changeTab(ACTIVE)
            }
        } catch (e: JSONException) {
        }
    }

    private var onLeaveChatroom = Emitter.Listener { args ->
        goBack()
        SocketInstance.isNotify.remove(roomTitle)
        mSocket?.emit("connected_chatrooms", JSONObject())
    }

    private fun sendMessage(roomTitle: String) {
        var messageToSend = messageComp.text.toString()
        if (messageToSend.replace("\\s+".toRegex(), "") != "") {
            var data = JSONObject()
            var user = activity!!.intent.getStringExtra("username")
            data.put("username", user)
            data.put("room", roomTitle)
            data.put("message", messageToSend)

            messageComp.setText("")

            mSocket?.emit("chatroom_message", data)
        }
    }

    fun updateActive() {
        if (!rooms.contains("[PRIV]${SocketInstance.roomName}")) {
            mSocket?.emit("connected_chatrooms", JSONObject())
        }
    }

    fun removePrivateRoom() {
        var index = rooms.indexOf("[PRIV]${SocketInstance.roomName}")
        if (index != -1) {
            rooms.removeAt(index)
            changeTab(ACTIVE)
        }
    }

    fun disableHint() {
        hintButton.isEnabled = false
    }

    fun activateHint() {
        hintButton.isEnabled = true
    }

    private fun changeTheme() {
        if (LocaleUtils.selectedThemeId == "dark") {
            roomsList.setBackgroundColor(resources.getColor(R.color.darkMode))
            chatRoomConst.setBackgroundColor(resources.getColor(R.color.darkMode))
            fragTitle.setBackgroundColor(resources.getColor(R.color.darkMode))
        } else {
            roomsList.setBackgroundColor(resources.getColor(R.color.white))
            chatRoomConst.setBackgroundColor(resources.getColor(R.color.white))
            fragTitle.setBackgroundColor(resources.getColor(R.color.white))
        }
    }

    fun offListeners() {
        mSocket?.off("chatroom_message")
        mSocket?.off("join_chatroom")
        mSocket?.off("chatroom_logs")
        mSocket?.off("all_chatrooms")
        mSocket?.off("connected_chatrooms")
        mSocket?.off("leave_chatroom")
    }
}
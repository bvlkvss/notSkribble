package com.example.client_leger

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.Fragment
import io.socket.emitter.Emitter
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject


class PlayMenuFragment : Fragment() {

    var mSocket = SocketInstance.getMSocket()

    private lateinit var modeSpinner: Spinner
    private lateinit var difficultySpinner: Spinner
    private lateinit var langSpinner: Spinner
    private lateinit var createButton: Button
    private lateinit var startButton: Button
    private lateinit var coopStartButton: Button
    private lateinit var joinButton: Button
    private lateinit var backToMenu: Button
    private lateinit var addVirtPlayer: Button
    private lateinit var name1: TextView
    private lateinit var name2: TextView
    private lateinit var name3: TextView
    private lateinit var name4: TextView
    private lateinit var classicavatar1: ImageView
    private lateinit var classicavatar2: ImageView
    private lateinit var classicavatar3: ImageView
    private lateinit var classicavatar4: ImageView
    private lateinit var coopName1: TextView
    private lateinit var coopName2: TextView
    private lateinit var coopName3: TextView
    private lateinit var coopName4: TextView
    private lateinit var coopavatar1: ImageView
    private lateinit var coopavatar2: ImageView
    private lateinit var coopavatar3: ImageView
    private lateinit var coopavatar4: ImageView
    private lateinit var virtPlayers: RadioGroup

    private lateinit var gameRoomsContainer: ConstraintLayout
    private lateinit var optionsLayout: ConstraintLayout
    private lateinit var waitingRoom: ConstraintLayout
    private lateinit var coopWaitingRoom: ConstraintLayout
    private lateinit var header: ConstraintLayout
    private lateinit var playMenu: ConstraintLayout
    private lateinit var virtLayout: ConstraintLayout
    private lateinit var gamesList: ListView

    var isUserCreatingRoom: Boolean = false
    var chosenVirtPlayer = "nice"

    private var gameRooms = ArrayList<String>()
    private var redteam = ArrayList<String>()
    private var redteamavatars = ArrayList<String>()
    private var blueteam = ArrayList<String>()
    private var blueteamavatars = ArrayList<String>()
    private var coopPlayers = ArrayList<String>()
    private var coopAvatars = ArrayList<String>()

    var chosenMode = "classic"
    var chosenDifficulty = "easy"
    var chosenLang = "fr"

    var dataName = JSONObject()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        var act = activity as MainMenu
        var v = inflater.inflate(R.layout.fragment_play_menu, container, false)
        modeSpinner = v.findViewById(R.id.mode)
        difficultySpinner = v.findViewById(R.id.difficulty)
        langSpinner = v.findViewById(R.id.lang)
        createButton = v.findViewById(R.id.createButton)
        startButton = v.findViewById<Button>(R.id.startButton)
        coopStartButton = v.findViewById<Button>(R.id.coopStartButton)
        joinButton = v.findViewById<Button>(R.id.joinButton)

        waitingRoom = v.findViewById<ConstraintLayout>(R.id.CLWaitingRoom)
        playMenu = v.findViewById<ConstraintLayout>(R.id.playMenuConst)
        coopWaitingRoom = v.findViewById<ConstraintLayout>(R.id.CoopWaitingRoom)
        gameRoomsContainer = v.findViewById<ConstraintLayout>(R.id.CLjoinGame)
        optionsLayout = v.findViewById<ConstraintLayout>(R.id.clplaymenu)
        gamesList = v.findViewById<ListView>(R.id.lvjoingamelist)
        backToMenu = v.findViewById(R.id.backToMenu)
        virtPlayers = v.findViewById(R.id.radioGroup)
        addVirtPlayer = v.findViewById(R.id.addVirtPlayer)
        virtLayout = v.findViewById(R.id.virtualPlayers)

        dataName.put("name", SocketInstance.username)

        isUserCreatingRoom = false

        name1 = v.findViewById(R.id.name1)
        name2 = v.findViewById(R.id.name2)
        name3 = v.findViewById(R.id.name3)
        name4 = v.findViewById(R.id.name4)
        classicavatar1 = v.findViewById(R.id.player1)
        classicavatar2 = v.findViewById(R.id.player2)
        classicavatar3 = v.findViewById(R.id.player3)
        classicavatar4 = v.findViewById(R.id.player4)

        coopName1 = v.findViewById(R.id.coopName1)
        coopName2 = v.findViewById(R.id.coopName2)
        coopName3 = v.findViewById(R.id.coopName3)
        coopName4 = v.findViewById(R.id.coopName4)
        coopavatar1 = v.findViewById(R.id.coopPlayer1)
        coopavatar2 = v.findViewById(R.id.coopPlayer2)
        coopavatar3 = v.findViewById(R.id.coopPlayer3)
        coopavatar4 = v.findViewById(R.id.coopPlayer4)

        ArrayAdapter.createFromResource(
            activity!!.baseContext,
            R.array.mode_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            modeSpinner.adapter = adapter
        }


        ArrayAdapter.createFromResource(
            activity!!.baseContext,
            R.array.difficulty_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            difficultySpinner.adapter = adapter
        }

        ArrayAdapter.createFromResource(
            activity!!.baseContext,
            R.array.lang_array,
            android.R.layout.simple_spinner_item
        ).also { adapter ->
            adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
            langSpinner.adapter = adapter
        }

        virtPlayers.setOnCheckedChangeListener { group, checkedId ->
            chosenVirtPlayer = v.findViewById<RadioButton>(checkedId).text.toString()
        }

        addVirtPlayer.setOnClickListener {
            var data = JSONObject()
            data.put("name", SocketInstance.roomName)
            data.put("type", getVirtType())
            data.put("team", getUserTeamColor())
            if (addVirtPlayer.text == getString(R.string.addVirtualPlayers)) {
                addVirtPlayer.text = getString(R.string.removeVirtualPlayers)
                for (i in 0 until virtPlayers.childCount) {
                    (virtPlayers.getChildAt(i) as RadioButton).isEnabled = false
                }
                mSocket?.emit("add_virtual_player", data)
            } else {
                addVirtPlayer.text = getString(R.string.addVirtualPlayers)
                for (i in 0 until virtPlayers.childCount) {
                    (virtPlayers.getChildAt(i) as RadioButton).isEnabled = true
                }
                mSocket?.emit("remove_virtual_player", data)
            }
        }

        startButton.setOnClickListener {
            mSocket?.emit("start_gameroom", dataName)
        }

        coopStartButton.setOnClickListener {
            mSocket?.emit("start_gameroom", dataName)
        }

        createButton.setOnClickListener {
            isUserCreatingRoom = true
            SocketInstance.roomName = SocketInstance.username
            if (chosenMode == "free") {
                val intent = Intent(activity, FreeGamePage::class.java)
                offListerners()
                startActivity(intent)
            } else if (chosenMode == "solo") {
                val intent = Intent(activity, SoloGamePage::class.java)
                offListerners()
                startActivity(intent)
            }

            var data = JSONObject()
            data.put("name", SocketInstance.username)
            data.put("difficulty", chosenDifficulty)
            data.put("type", chosenMode)
            data.put("lang", chosenLang)
            mSocket?.emit("game_info", data)
        }

        joinButton.setOnClickListener {
            header = act.findViewById(R.id.clheader)
            header.visibility = View.GONE
            gameRoomsContainer.visibility = View.VISIBLE
            optionsLayout.visibility = View.GONE


            var data = JSONObject()
            data.put("type", chosenMode)
            data.put("difficulty", chosenDifficulty)
            data.put("lang", chosenLang)
            mSocket?.emit("get_gamerooms", data)
        }

        backToMenu.setOnClickListener {
            header = act.findViewById(R.id.clheader)
            gameRoomsContainer.visibility = View.GONE
            header.visibility = View.VISIBLE
            optionsLayout.visibility = View.VISIBLE
            gameRooms.clear()
            val adapter =
                ArrayAdapter(activity!!.baseContext, android.R.layout.simple_list_item_1, gameRooms)
            activity!!.runOnUiThread(Runnable {
                gamesList.adapter = adapter
            })
        }

        v.findViewById<Button>(R.id.backToMenuClassic).setOnClickListener {
            header = act.findViewById(R.id.clheader)
            header.visibility = View.VISIBLE
            waitingRoom.visibility = View.GONE
            startButton.isEnabled = false
            optionsLayout.visibility = View.VISIBLE
            mSocket?.emit("quit_game", dataName)
            var fm = fragmentManager
            var fragm = fm?.findFragmentById(R.id.chatFrame) as RoomsChatFragment
            fragm.removePrivateRoom()
        }

        v.findViewById<Button>(R.id.backToMenuCoop).setOnClickListener {
            header = act.findViewById(R.id.clheader)
            header.visibility = View.VISIBLE
            coopStartButton.isEnabled = false
            coopWaitingRoom.visibility = View.GONE
            optionsLayout.visibility = View.VISIBLE
            mSocket?.emit("quit_game", dataName)
            var fm = fragmentManager
            var fragm = fm?.findFragmentById(R.id.chatFrame) as RoomsChatFragment
            fragm.removePrivateRoom()
        }

        v.findViewById<Button>(R.id.refresh).setOnClickListener {
            var data = JSONObject()
            data.put("type", chosenMode)
            data.put("difficulty", chosenDifficulty)
            data.put("lang", chosenLang)
            mSocket?.emit("get_gamerooms", data)
        }

        gamesList.setOnItemClickListener { parent, view, position, id ->
            var data = JSONObject()
            data.put("name", gameRooms[position])
            mSocket?.emit("join_gameroom", data)
        }

        modeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                joinButton.isEnabled = true
                createButton.isEnabled = true
                chosenMode = modeSpinner.selectedItem.toString()
                when (chosenMode) {
                    "Classique" -> chosenMode = "classic"
                    "Classic" -> chosenMode = "classic"
                    "Coopératif" -> chosenMode = "coop"
                    "Cooperative" -> chosenMode = "coop"
                    "Aveugle" -> chosenMode = "blind"
                    "Blind" -> chosenMode = "blind"
                    "Solo" -> {
                        chosenMode = "solo"
                        joinButton.isEnabled = false
                    }
                    "Libre" -> {
                        chosenMode = "free"
                        joinButton.isEnabled = false
                    }
                    "Free" -> {
                        chosenMode = "free"
                        joinButton.isEnabled = false
                    }
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        difficultySpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                chosenDifficulty = difficultySpinner.selectedItem.toString()
                when (chosenDifficulty) {
                    "Facile" -> chosenDifficulty = "easy"
                    "Easy" -> chosenDifficulty = "easy"
                    "Moyen" -> chosenDifficulty = "mid"
                    "Medium" -> chosenDifficulty = "mid"
                    "Difficile" -> chosenDifficulty = "hard"
                    "Hard" -> chosenDifficulty = "hard"
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        langSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                chosenLang = langSpinner.selectedItem.toString()
                when (chosenLang) {
                    "Français" -> chosenLang = "fr"
                    "French" -> chosenLang = "fr"
                    "Anglais" -> chosenLang = "en"
                    "English" -> chosenLang = "en"
                }
            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        mSocket?.on("get_gamerooms", onGetGamerooms)
        mSocket?.on("join_gameroom", onJoinGameroom)
        mSocket?.on("start_gameroom", onStartGameroom)
        mSocket?.on("end_gameroom", onEndGameroom)
        return v
    }

    private var onEndGameroom = Emitter.Listener { args ->
        try {
            var message = getString(R.string.endgameroom)
            activity!!.runOnUiThread {
                val dialogBuilder = AlertDialog.Builder(context!!)
                dialogBuilder.setMessage(message)
                dialogBuilder.setPositiveButton("OK",
                    DialogInterface.OnClickListener { dialog, whichButton ->
                        val intent = Intent(context!!, MainMenu::class.java)
                        intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                        mSocket?.off("start_gameroom")
                        mSocket?.off("end_gameroom")
                        mSocket?.off("verify_answer")
                        mSocket?.off("next_round")
                        mSocket?.off("virtual_draw")
                        mSocket?.off("disconnect")
                        startActivity(intent)
                    })
                dialogBuilder.setOnCancelListener {
                    val intent = Intent(context!!, MainMenu::class.java)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                    mSocket?.off("start_gameroom")
                    mSocket?.off("verify_answer")
                    mSocket?.off("next_round")
                    mSocket?.off("end_gameroom")
                    mSocket?.off("virtual_draw")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                }
                val b = dialogBuilder.create()
                b.show()
            }
        } catch (e: JSONException) {
        }
    }

    private var onGetGamerooms = Emitter.Listener { args ->
        try {
            val response = args[0] as JSONObject
            val data = response["data"] as JSONArray
            gameRooms.clear()
            var users: HashMap<String, JSONArray> = HashMap()

            for (i in 0 until data.length()) {
                val gameroom = data.get(i) as JSONObject
                gameRooms.add(gameroom["name"].toString())
                users[gameroom["name"].toString()] = gameroom["users"] as JSONArray
            }

            val adapter = AvailableRoomsAdapter(activity!!, gameRooms, users)
            activity!!.runOnUiThread(Runnable {
                gamesList.adapter = adapter
            })
        } catch (e: JSONException) {
        }

    }

    private fun getVirtType(): String {
        when (chosenVirtPlayer) {
            getString(R.string.nice) -> return "nice"
            getString(R.string.rude) -> return "rude"
            getString(R.string.arrogant) -> return "arrogant"
        }
        return "nice"
    }

    private fun getUserTeamColor(): String {
        if (redteam.contains(SocketInstance.username)) {
            return "red"
        }
        return "blue"
    }

    private var onJoinGameroom = Emitter.Listener { args ->
        try {
            val response = args[0] as JSONObject
            if (response["code"] == 1) {
                var data = response["data"] as JSONObject
                var act = activity as MainMenu
                activity!!.runOnUiThread {
                    header = act.findViewById(R.id.clheader)
                    header.visibility = View.GONE
                    gameRoomsContainer.visibility = View.GONE
                    optionsLayout.visibility = View.GONE
                    virtLayout.visibility = View.VISIBLE
                    if (chosenMode == "blind") {
                        virtLayout.visibility = View.GONE
                    }
                }

                var fm = fragmentManager
                var fragm = fm?.findFragmentById(R.id.chatFrame) as RoomsChatFragment
                fragm.updateActive()

                if (chosenMode == "classic" || chosenMode == "blind") {
                    val red = data["red"] as JSONArray
                    var redavatars = data["red_avatars"] as JSONArray
                    val blue = data["blue"] as JSONArray
                    var blueavatars = data["blue_avatars"] as JSONArray

                    redteam.clear()
                    redteamavatars.clear()
                    blueteam.clear()
                    blueteamavatars.clear()

                    activity!!.runOnUiThread {
                        startButton.isEnabled = false
                        waitingRoom.visibility = View.VISIBLE
                        name1.text = ""
                        name2.text = ""
                        name3.text = ""
                        name4.text = ""
                        classicavatar1.setImageDrawable(null)
                        classicavatar2.setImageDrawable(null)
                        classicavatar3.setImageDrawable(null)
                        classicavatar4.setImageDrawable(null)
                    }

                    if (red.length() == 2 && blue.length() == 2) {
                        activity!!.runOnUiThread {
                            startButton.isEnabled = true
                        }
                    }
                    for (i in 0 until red.length()) {
                        redteam.add(red.get(i).toString())
                        redteamavatars.add(redavatars.get(i).toString())
                    }
                    for (i in 0 until blue.length()) {
                        blueteam.add(blue.get(i).toString())
                        blueteamavatars.add(blueavatars.get(i).toString())
                    }

                    SocketInstance.roomName = blue[0].toString()
                    if (blue.length() > 0) {
                        if (blue.get(0).toString() != SocketInstance.username) {
                            activity!!.runOnUiThread {
                                startButton.visibility = View.GONE
                            }
                        }
                        if (blue.length() > 1) {
                            var avatarname2 = "avatar${blueavatars.get(1)}"
                            var avatarid2 = context!!.resources
                                .getIdentifier(avatarname2, "drawable", context!!.packageName)
                            activity!!.runOnUiThread {
                                name2.text = blue.get(1).toString()
                                classicavatar2.setImageResource(avatarid2)
                            }
                        }
                        var avatarname1 = "avatar${blueavatars.get(0)}"
                        var avatarid1 = context!!.resources
                            .getIdentifier(avatarname1, "drawable", context!!.packageName)
                        activity!!.runOnUiThread {
                            name1.text = blue.get(0).toString()
                            classicavatar1.setImageResource(avatarid1)
                        }
                    }
                    if (red.length() > 0) {
                        if (red.length() > 1) {
                            var avatarname4 = "avatar${redavatars.get(1)}"
                            var avatarid4 = context!!.resources
                                .getIdentifier(avatarname4, "drawable", context!!.packageName)
                            activity!!.runOnUiThread {
                                name4.text = red.get(1).toString()
                                classicavatar4.setImageResource(avatarid4)
                            }
                        }
                        var avatarname3 = "avatar${redavatars.get(0)}"
                        var avatarid3 = context!!.resources
                            .getIdentifier(avatarname3, "drawable", context!!.packageName)
                        activity!!.runOnUiThread {
                            name3.text = red.get(0).toString()
                            classicavatar3.setImageResource(avatarid3)
                        }
                    }
                } else if (chosenMode == "coop") {
                    activity!!.runOnUiThread {
                        coopWaitingRoom.visibility = View.VISIBLE
                        coopStartButton.isEnabled = false
                        coopName1.text = ""
                        coopName2.text = ""
                        coopName3.text = ""
                        coopName4.text = ""
                        coopavatar1.setImageDrawable(null)
                        coopavatar2.setImageDrawable(null)
                        coopavatar3.setImageDrawable(null)
                        coopavatar4.setImageDrawable(null)
                    }
                    coopPlayers.clear()
                    coopAvatars.clear()

                    var players = data["players"] as JSONArray
                    var avatars = data["avatars"] as JSONArray
                    SocketInstance.roomName = players[0].toString()
                    var avatarname1 = "avatar${avatars.get(0)}"
                    var avatarid1 = context!!.resources
                        .getIdentifier(avatarname1, "drawable", context!!.packageName)
                    activity!!.runOnUiThread {
                        coopName1.text = players.get(0) as String
                        coopavatar1.setImageResource(avatarid1)
                    }

                    for (i in 0 until players.length()) {
                        coopPlayers.add(players.get(i).toString())
                        coopAvatars.add(avatars.get(i).toString())
                    }

                    if (players.length() > 1) {
                        var avatarname2 = "avatar${avatars.get(1)}"
                        var avatarid2 = context!!.resources
                            .getIdentifier(avatarname2, "drawable", context!!.packageName)
                        activity!!.runOnUiThread {
                            coopName2.text = players.get(1).toString()
                            coopavatar2.setImageResource(avatarid2)
                            if (SocketInstance.username == SocketInstance.roomName) {
                                activity!!.runOnUiThread {
                                    coopStartButton.isEnabled = true
                                }
                            }
                        }
                    }
                    if (players.length() > 2) {
                        var avatarname3 = "avatar${avatars.get(2)}"
                        var avatarid3 = context!!.resources
                            .getIdentifier(avatarname3, "drawable", context!!.packageName)
                        activity!!.runOnUiThread {
                            coopName3.text = players.get(2).toString()
                            coopavatar3.setImageResource(avatarid3)
                        }
                    }
                    if (players.length() > 3) {
                        var avatarname4 = "avatar${avatars.get(3)}"
                        var avatarid4 = context!!.resources
                            .getIdentifier(avatarname4, "drawable", context!!.packageName)
                        activity!!.runOnUiThread {
                            coopName4.text = players.get(3).toString()
                            coopavatar4.setImageResource(avatarid4)
                        }
                    }
                }
            } else {
                showDialog(2)
                var data = JSONObject()
                data.put("type", chosenMode)
                data.put("difficulty", chosenDifficulty)
                data.put("lang", chosenLang)
                mSocket?.emit("get_gamerooms", data)
            }
        } catch (e: JSONException) {
        }
    }

    private var onStartGameroom = Emitter.Listener { args ->
        try {

            var response = args[0] as JSONObject
            if (response["code"] != 2) {
                offListerners()

                val intent = Intent(activity, GamePage::class.java)
                intent.putExtra("data", response.toString())
                intent.putExtra("redteam", redteam)
                intent.putExtra("redteamavatars", redteamavatars)
                intent.putExtra("blueteam", blueteam)
                intent.putExtra("blueteamavatars", blueteamavatars)
                if (chosenMode == "classic") {
                    intent.putExtra("isBlind", false)
                    startActivity(intent)
                } else if (chosenMode == "blind") {
                    intent.putExtra("isBlind", true)
                    startActivity(intent)
                } else if (chosenMode == "coop") {
                    val intentCoop = Intent(activity, CoopGamePage::class.java)
                    intentCoop.putExtra("data", response.toString())
                    intentCoop.putExtra("players", coopPlayers)
                    intentCoop.putExtra("avatars", coopAvatars)
                    startActivity(intentCoop)
                }
            } else {
                showDialog(1)
            }
        } catch (e: JSONException) {
        }
    }

    private fun showDialog(code: Int) {
        activity!!.runOnUiThread(Runnable {
            val dialogBuilder = AlertDialog.Builder(activity)
            if (code == 1) {
                dialogBuilder.setMessage(getString(R.string.createError))
                dialogBuilder.setPositiveButton("OK",
                    DialogInterface.OnClickListener { dialog, whichButton ->
                        val intent = Intent(activity, MainMenu::class.java)
                        startActivity(intent)
                    })
            } else if (code == 2) {
                dialogBuilder.setMessage(getString(R.string.gameDoesntExist))
                dialogBuilder.setPositiveButton("OK",
                    DialogInterface.OnClickListener { dialog, whichButton ->
                    })
            }
            val b = dialogBuilder.create()
            b.show()
        })

    }

    fun offListerners() {
        mSocket?.off("join_gameroom")
        mSocket?.off("end_gameroom")
        mSocket?.off("start_gameroom")
        mSocket?.off("get_gamerooms")
    }
}
package com.example.client_leger

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


class ProfileFragment : Fragment() {


    var mSocket = SocketInstance.getMSocket()

    private lateinit var avatar: ImageView
    private lateinit var connexionHistoryButton: Button
    private lateinit var gameHistoryButton: Button

    private lateinit var firstname: TextView
    private lateinit var lastname: TextView
    private lateinit var username: TextView
    private lateinit var gameplayed: TextView
    private lateinit var victoryrate: TextView
    private lateinit var avgtime: TextView
    private lateinit var totaltime: TextView
    private lateinit var soloscore: TextView
    private lateinit var background: ConstraintLayout
    private lateinit var loginHistoryList: ListView
    private lateinit var statsList: ListView

    var loginHistory = ArrayList<JSONObject>()
    var logoutHistory = ArrayList<JSONObject>()
    var gameHistory = ArrayList<JSONObject>()

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        var v = inflater.inflate(R.layout.fragment_profile, container, false)
        avatar = v.findViewById(R.id.profilAvatar)

        connexionHistoryButton = v.findViewById(R.id.openConHistory)
        gameHistoryButton = v.findViewById(R.id.openGameHistory)

        firstname = v.findViewById(R.id.firstname)
        lastname = v.findViewById(R.id.lastname)
        username = v.findViewById(R.id.profileUser)
        gameplayed = v.findViewById(R.id.numberGames)
        victoryrate = v.findViewById(R.id.pourcVictories)
        avgtime = v.findViewById(R.id.averageTime)
        totaltime = v.findViewById(R.id.timeSpent)
        background = v.findViewById(R.id.profilbackground)
        loginHistoryList = v.findViewById(R.id.historyList)
        statsList = v.findViewById(R.id.statsList)
        soloscore = v.findViewById(R.id.solomax)

        connexionHistoryButton.setOnClickListener {
            if (v.findViewById<LinearLayout>(R.id.loginTable).visibility == View.VISIBLE) {
                connexionHistoryButton.text = getString(R.string.seeConnection)
                v.findViewById<LinearLayout>(R.id.loginTable).visibility = View.GONE
            } else {
                connexionHistoryButton.text = getString(R.string.hideConnection)
                v.findViewById<LinearLayout>(R.id.loginTable).visibility = View.VISIBLE
            }
        }
        gameHistoryButton.setOnClickListener {
            if (v.findViewById<LinearLayout>(R.id.historyTable).visibility == View.VISIBLE) {
                gameHistoryButton.text = getString(R.string.seeStats)
                v.findViewById<LinearLayout>(R.id.historyTable).visibility = View.GONE
            } else {
                gameHistoryButton.text = getString(R.string.hideStats)
                v.findViewById<LinearLayout>(R.id.historyTable).visibility = View.VISIBLE
            }
        }


        mSocket?.on("user_stats", onUserStats)
        return v
    }

    private var onUserStats = Emitter.Listener { args ->
        try {
            val response = args[0] as JSONObject

            if (response["data"] != null) {
                var data = response["data"] as JSONObject
                val connecionHistory = data["connection_timestamps"] as JSONArray
                val disconnectHistory = data["disconnection_timestamps"] as JSONArray
                val gameHist = data["game_history"] as JSONArray

                var avatarname = "avatar${data["avatar"]}"
                SocketInstance.useravatar = avatarname
                var avatarid = context!!.resources
                    .getIdentifier(avatarname, "drawable", context!!.packageName)

                var avggtime = data["average_game_time"] as JSONObject
                var avggtimestring = getString(
                    R.string.avggametimecomposes,
                    avggtime["days"].toString(),
                    avggtime["hours"].toString(),
                    avggtime["minutes"].toString(),
                    avggtime["seconds"].toString()
                )

                var totaltimejson = data["total_game_time"] as JSONObject
                var totaltimestring = getString(
                    R.string.avggametimecomposes,
                    totaltimejson["days"].toString(),
                    totaltimejson["hours"].toString(),
                    totaltimejson["minutes"].toString(),
                    totaltimejson["seconds"].toString()
                )

                loginHistory.clear()
                logoutHistory.clear()
                gameHistory.clear()

                for (i in 0 until connecionHistory.length()) {
                    loginHistory.add(connecionHistory[i] as JSONObject)
                }
                for (i in 0 until disconnectHistory.length()) {
                    logoutHistory.add(disconnectHistory[i] as JSONObject)
                }
                for (i in 0 until gameHist.length()) {
                    gameHistory.add(gameHist[i] as JSONObject)
                }
                var adapter = ProfileListAdapter(activity!!, loginHistory, logoutHistory)
                adapter.notifyDataSetChanged()
                var adapterTab2 = ProfileListAdapter2(activity!!, gameHistory)
                adapterTab2.notifyDataSetChanged()
                var victory2decimals = Math.round((data["win_ratio"] as Double) * 100.0) / 100.0
                activity!!.runOnUiThread {
                    firstname.text = getString(R.string.firstName, data["first_name"].toString())
                    lastname.text = getString(R.string.lastName, data["last_name"].toString())
                    avatar.setImageResource(avatarid)
                    username.text =
                        getString(R.string.usernameProfile, data["user_name"].toString())
                    gameplayed.text = getString(R.string.gamePlayed, data["game_count"].toString())
                    victoryrate.text =
                        getString(R.string.victoryRate, victory2decimals.toString()) + " %"
                    avgtime.text = getString(R.string.averageTime, avggtimestring)
                    totaltime.text = getString(R.string.totalTime, totaltimestring)
                    soloscore.text =
                        getString(R.string.soloScore, data["solo_max_score"].toString())
                    loginHistoryList.adapter = adapter
                    statsList.adapter = adapterTab2
                }
            }
        } catch (e: JSONException) {
        }
    }
}

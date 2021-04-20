package com.example.client_leger

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import io.socket.emitter.Emitter
import org.json.JSONObject


class MainMenu : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private lateinit var playButton: TextView
    private lateinit var profileButton: TextView
    private lateinit var tutorialButton: TextView
    private lateinit var optionsButton: TextView
    private lateinit var menuTitle: TextView

    private lateinit var playFrag: View
    private lateinit var profileFrag: View
    private lateinit var tutorialFrag: View
    private lateinit var optionsFrag: View
    private lateinit var clMenu: ConstraintLayout
    var array = ArrayList<TextView>(2)


    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Application.instance?.initAppLanguage(this)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_main_menu)

        playButton = findViewById<TextView>(R.id.tvplay)
        profileButton = findViewById<TextView>(R.id.tvprofil)
        tutorialButton = findViewById<TextView>(R.id.tvtutorial)
        optionsButton = findViewById<TextView>(R.id.tvoptions)
        menuTitle = findViewById<TextView>(R.id.menutitle)

        playFrag = findViewById(R.id.playFrag)
        profileFrag = findViewById(R.id.profileFrag)
        tutorialFrag = findViewById(R.id.tutoFrag)
        optionsFrag = findViewById(R.id.optionsFrag)
        clMenu = findViewById(R.id.CLMenu)

        changeTheme()

        array = arrayListOf(playButton, profileButton, tutorialButton, optionsButton)

        if (intent.extras?.get("fromCreate") == true) {
            setCurrentTab(tutorialButton)
            replaceFragment("tutorial")
        } else if (intent.extras?.get("changeoptions") == true) {
            setCurrentTab(optionsButton)
            replaceFragment("options")
        } else {
            replaceFragment("play")
        }
        playButton.setOnClickListener {
            setCurrentTab(playButton)
            replaceFragment("play")
        }
        mSocket?.emit("user_stats", JSONObject())

        profileButton.setOnClickListener {
            setCurrentTab(profileButton)
            replaceFragment("profile")
            mSocket?.emit("user_stats", JSONObject())
        }

        tutorialButton.setOnClickListener {
            setCurrentTab(tutorialButton)
            replaceFragment("tutorial")
        }

        optionsButton.setOnClickListener {
            setCurrentTab(optionsButton)
            replaceFragment("options")
        }

        var logoutButton = findViewById<TextView>(R.id.logout)
        logoutButton.setOnClickListener {
            var data = JSONObject()
            mSocket?.emit("disconnect_user", data)
        }

        var fm = supportFragmentManager
        var fragm = fm.findFragmentById(R.id.chatFrame) as RoomsChatFragment
        fragm.updateActive()

        mSocket?.on("disconnect_user", onDisconnectUser)
        mSocket?.on("disconnect", onDisconnect)
    }

    private fun setCurrentTab(clickedTab: TextView) {
        for (tab in array) {
            if (tab == clickedTab) {
                tab.background = ContextCompat.getDrawable(this, R.drawable.active_tab)
                tab.setTextColor(ContextCompat.getColor(this, R.color.purple_light))
            } else {
                tab.background = ContextCompat.getDrawable(this, R.drawable.header_border)
                if (LocaleUtils.selectedThemeId == "light") {
                    tab.setTextColor(ContextCompat.getColor(this, R.color.black))
                } else {
                    tab.setTextColor(ContextCompat.getColor(this, R.color.white))
                }
            }
        }
    }

    private fun replaceFragment(f: String) {
        playFrag.visibility = View.GONE
        profileFrag.visibility = View.GONE
        tutorialFrag.visibility = View.GONE
        optionsFrag.visibility = View.GONE
        when (f) {
            "play" -> playFrag.visibility = View.VISIBLE
            "profile" -> profileFrag.visibility = View.VISIBLE
            "tutorial" -> tutorialFrag.visibility = View.VISIBLE
            "options" -> optionsFrag.visibility = View.VISIBLE
        }
    }

    private var onDisconnectUser = Emitter.Listener { args ->
        var fm = supportFragmentManager
        var fragm = fm.findFragmentById(R.id.playFrag) as PlayMenuFragment
        fragm.offListerners()
        val intent = Intent(this, MainActivity::class.java)
        mSocket?.off("disconnect_user")
        mSocket?.off("disconnect")
        startActivity(intent)
    }

    private val onDisconnect = Emitter.Listener { args ->
        runOnUiThread {
            val dialogBuilder = AlertDialog.Builder(this)
            dialogBuilder.setMessage(getString(R.string.serverDown))
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton ->
                    val intent = Intent(this, MainActivity::class.java)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                    mSocket?.off("disconnect_user")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                })
            dialogBuilder.setOnCancelListener {
                val intent = Intent(this, MainActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                mSocket?.off("disconnect_user")
                mSocket?.off("disconnect")
                startActivity(intent)
            }
            val b = dialogBuilder.create()
            b.show()
        }
    }

    override fun onBackPressed() {}

    private fun changeTheme() {
        if (LocaleUtils.selectedThemeId == "dark") {
            clMenu.setBackgroundColor(resources.getColor(R.color.darkMode))
            menuTitle.setBackgroundColor(resources.getColor(R.color.darkMode))
        } else {
            clMenu.setBackgroundColor(resources.getColor(R.color.white))
            menuTitle.setBackgroundColor(resources.getColor(R.color.white))
        }
    }
}
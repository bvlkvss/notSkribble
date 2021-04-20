package com.example.client_leger

import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import io.socket.emitter.Emitter
import org.json.JSONException
import org.json.JSONObject


class MainActivity : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private lateinit var errorComp: TextView
    private lateinit var usernameComp: EditText
    private lateinit var passwordComp: EditText
    private lateinit var button: Button
    private lateinit var form: ConstraintLayout

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Application.instance?.initAppLanguage(this)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_main)
        form = findViewById(R.id.constraintLayout)

        errorComp = findViewById<TextView>(R.id.tverror)
        usernameComp = findViewById<EditText>(R.id.etusername)
        passwordComp = findViewById<EditText>(R.id.etpassword)
        button = findViewById<Button>(R.id.button)

        if (LocaleUtils.selectedThemeId == "dark") {
            val shape: GradientDrawable = form.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.darkMode))
        } else {
            val shape: GradientDrawable = form.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.white))
        }

        SocketInstance.isNotify = HashMap()

        usernameComp.afterTextChanged {}
        passwordComp.afterTextChanged {}

        mSocket?.on("authenticate_user", onAuthenticate)
        mSocket?.on("disconnect", onDisconnect)

    }

    private val onAuthenticate = Emitter.Listener { args ->
        try {
            val data = args[0] as JSONObject
            val info = data["data"] as JSONObject
            val code = data["code"] as Int
            if(code == 1){
                SocketInstance.timeStamp = info["timestamp"].toString()
            }
            runOnUiThread(Runnable {
                openlog(code)
            })
        }
        catch(e:JSONException){}
    }

    private fun openlog(code: Int) {
        if (code == 1) {
            errorComp.visibility = View.INVISIBLE
            val intent = Intent(this, MainMenu::class.java)
            intent.putExtra("username", SocketInstance.username)
            mSocket?.off("authenticate_user")
            mSocket?.off("disconnect")
            startActivity(intent)
        } else if (code == 6) {
            errorComp.text = getString(R.string.alreadyConnected)
            errorComp.visibility = View.VISIBLE
        } else if (code == 2) {
            errorComp.text = getString(R.string.serverDown)
            errorComp.visibility = View.VISIBLE
        } else if (code == 4 || code == 5) {
            errorComp.text = getString(R.string.incorrect_login)
            errorComp.visibility = View.VISIBLE
        }

    }

    private fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
        this.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val username = usernameComp.text.toString()
                val password = passwordComp.text.toString()
                button.isEnabled = username.isNotEmpty() && password.isNotEmpty()
            }

            override fun afterTextChanged(editable: Editable?) {
                afterTextChanged.invoke(editable.toString())
            }
        })
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    fun connectionValidation(view: View) {
        view.hideKeyboard()

        var username = usernameComp.text.toString()
        SocketInstance.username = username
        var password = passwordComp.text.toString()

        var cleanUser = username.replace("\\s+".toRegex(), "")
        var cleanPw = password.replace("\\s+".toRegex(), "")


        if (cleanUser != "" && cleanPw != "") {
            var data = JSONObject()
            data.put("username", username)
            data.put("password", password)
            mSocket?.emit("authenticate_user", data)

        } else {
            errorComp.visibility = View.INVISIBLE

            if (cleanUser == "") {
                usernameComp.error = "Entrez un nom d\'utilisateur"
                usernameComp.backgroundTintList = ContextCompat.getColorStateList(this, R.color.red)
            }
            if (cleanPw == "") {
                passwordComp.error = "Entrez un mot de passe"
                passwordComp.backgroundTintList = ContextCompat.getColorStateList(this, R.color.red)
            }
        }

    }

    fun openCreateAccount(view: View) {
        val intent = Intent(this, CreateAccount::class.java)
        mSocket?.off("authenticate_user")
        mSocket?.off("disconnect")
        startActivity(intent)
    }

    override fun onBackPressed() {}

    private fun View.hideKeyboard() {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(windowToken, 0)
    }

    override fun onDestroy() {
        super.onDestroy()
        mSocket?.disconnect()
    }

    private val onDisconnect = Emitter.Listener { args ->
        runOnUiThread {
            val dialogBuilder = AlertDialog.Builder(this)
            dialogBuilder.setMessage(getString(R.string.serverDown))
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton -> })
            val b = dialogBuilder.create()
            b.show()
        }
    }

}

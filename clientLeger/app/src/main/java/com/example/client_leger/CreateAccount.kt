package com.example.client_leger

import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.graphics.drawable.GradientDrawable
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.view.inputmethod.InputMethodManager
import android.widget.Button
import android.widget.EditText
import android.widget.ImageButton
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import io.socket.emitter.Emitter
import org.json.JSONException
import org.json.JSONObject

class CreateAccount : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private lateinit var errorComp: TextView
    private lateinit var failComp: TextView
    private lateinit var usernameComp: EditText
    private lateinit var nameComp: EditText
    private lateinit var lastNameComp: EditText
    private lateinit var passwordComp: EditText
    private lateinit var confirmPasswordComp: EditText
    private lateinit var pwComp: TextView
    private lateinit var button: Button
    private lateinit var layout: ConstraintLayout
    private lateinit var avatar1: ImageButton
    private lateinit var avatar2: ImageButton
    private lateinit var avatar3: ImageButton
    private lateinit var avatar4: ImageButton
    private lateinit var avatar5: ImageButton
    private lateinit var avatar6: ImageButton
    private lateinit var avatar7: ImageButton
    private lateinit var avatar8: ImageButton
    private lateinit var previousAvatar: ImageButton
    var chosenAvatar = 1

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_create_account)

        errorComp = findViewById(R.id.tverrorcreate)
        failComp = findViewById(R.id.fail)
        usernameComp = findViewById(R.id.etcreateusername)
        nameComp = findViewById(R.id.etcreatename)
        lastNameComp = findViewById(R.id.etcreatelastname)
        passwordComp = findViewById(R.id.etcreatepassword)
        confirmPasswordComp = findViewById(R.id.etconfirmpassword)
        pwComp = findViewById(R.id.pwerror)
        button = findViewById(R.id.button)
        layout = findViewById(R.id.constraintLayoutCreate)
        avatar1 = findViewById(R.id.avatar1)
        avatar2 = findViewById(R.id.avatar2)
        avatar3 = findViewById(R.id.avatar3)
        avatar4 = findViewById(R.id.avatar4)
        avatar5 = findViewById(R.id.avatar5)
        avatar6 = findViewById(R.id.avatar6)
        avatar7 = findViewById(R.id.avatar7)
        avatar8 = findViewById(R.id.avatar8)

        previousAvatar = avatar1
        if (LocaleUtils.selectedThemeId == "dark") {
            val shape: GradientDrawable = layout.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.darkMode))
        } else {
            val shape: GradientDrawable = layout.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.white))
        }

        avatar1.setOnClickListener {
            chosenAvatar = 1
            previousAvatar.background = null
            avatar1.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar1
        }
        avatar2.setOnClickListener {
            chosenAvatar = 2
            previousAvatar.background = null
            avatar2.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar2
        }
        avatar3.setOnClickListener {
            chosenAvatar = 3
            previousAvatar.background = null
            avatar3.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar3
        }
        avatar4.setOnClickListener {
            chosenAvatar = 4
            previousAvatar.background = null
            avatar4.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar4
        }
        avatar5.setOnClickListener {
            chosenAvatar = 5
            previousAvatar.background = null
            avatar5.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar5
        }
        avatar6.setOnClickListener {
            chosenAvatar = 6
            previousAvatar.background = null
            avatar6.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar6
        }
        avatar7.setOnClickListener {
            chosenAvatar = 7
            previousAvatar.background = null
            avatar7.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar7
        }
        avatar8.setOnClickListener {
            chosenAvatar = 8
            previousAvatar.background = null
            avatar8.setBackgroundColor(resources.getColor(R.color.grey))
            previousAvatar = avatar8
        }

        mSocket?.on("create_user", onAuthenticate)
        mSocket?.on("disconnect", onDisconnect)

        usernameComp.afterTextChanged {}
        nameComp.afterTextChanged {}
        lastNameComp.afterTextChanged {}
        passwordComp.afterTextChanged {}
        confirmPasswordComp.afterTextChanged {}
    }

    private fun EditText.afterTextChanged(afterTextChanged: (String) -> Unit) {
        this.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {
            }

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                val username = usernameComp.text.toString()
                val name = nameComp.text.toString()
                val lastname = lastNameComp.text.toString()
                val password = passwordComp.text.toString()
                val confirmPw = confirmPasswordComp.text.toString()
                if (username.length < 3) {
                    usernameComp.error = "Min 3 caracteres."
                }
                if (name.length < 3) {
                    nameComp.error = "Min 3 caracteres."
                }
                if (lastname.length < 3) {
                    lastNameComp.error = "Min 3 caracteres."
                }
                if (password.length < 8) {
                    passwordComp.error = "Min 8 caracteres."
                }
                button.isEnabled = username.length > 2 && password.length > 7 && name.length > 2
                        && lastname.length > 2 && confirmPw.isNotEmpty()
            }

            override fun afterTextChanged(editable: Editable?) {
                afterTextChanged.invoke(editable.toString())
            }
        })
    }

    private val onAuthenticate = Emitter.Listener { args ->
        try {
            var data = args[0] as JSONObject
            var info = data["data"] as JSONObject
            var code = data["code"] as Int
            if (code == 1) {
                SocketInstance.timeStamp = info["timestamp"].toString()
            }

            runOnUiThread(Runnable {
                openlog(code)
            })
        } catch (e: JSONException) {
        }
    }

    private fun openlog(code: Int) {
        errorComp.visibility = View.INVISIBLE
        failComp.visibility = View.INVISIBLE
        if (code == 1) {
            var data = JSONObject()
            data.put("username", SocketInstance.username)
            data.put("room", "general")
            mSocket?.emit("join_chatroom", data)
            LocaleUtils.selectedThemeId = "light"

            val intent = Intent(this, MainMenu::class.java)
            intent.putExtra("fromCreate", true)
            mSocket?.off("create_user")
            mSocket?.off("disconnect")
            startActivity(intent)
        } else if (code == 4) {
            errorComp.visibility = View.VISIBLE
        } else {
            failComp.visibility = View.VISIBLE
        }

    }

    fun openConnection(view: View) {
        mSocket?.off("create_user")
        onBackPressed()
        view.hideKeyboard()
    }

    fun submit(view: View) {

        view.hideKeyboard()
        val username = usernameComp.text.toString()
        val name = nameComp.text.toString()
        val lastName = lastNameComp.text.toString()
        val password = passwordComp.text.toString()
        val confirmPassword = confirmPasswordComp.text.toString()


        errorComp.visibility = View.INVISIBLE
        failComp.visibility = View.INVISIBLE
        pwComp.visibility = View.INVISIBLE

        if (password != confirmPassword) {
            pwComp.visibility = View.VISIBLE
        } else {
            val data = JSONObject()
            data.put("username", username)
            data.put("first_name", name)
            data.put("last_name", lastName)
            data.put("password", password)
            data.put("avatar", chosenAvatar)
            SocketInstance.username = username
            mSocket?.emit("create_user", data)
        }
    }

    private val onDisconnect = Emitter.Listener { args ->
        runOnUiThread {
            val dialogBuilder = AlertDialog.Builder(this)
            dialogBuilder.setMessage(getString(R.string.serverDown))
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton ->
                    val intent = Intent(this, MainActivity::class.java)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                    mSocket?.off("create_user")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                })
            dialogBuilder.setOnCancelListener {
                val intent = Intent(this, MainActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                mSocket?.off("create_user")
                mSocket?.off("disconnect")
                startActivity(intent)
            }
            val b = dialogBuilder.create()
            b.show()
        }
    }

    private fun View.hideKeyboard() {
        val imm = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
        imm.hideSoftInputFromWindow(windowToken, 0)
    }
}

package com.example.client_leger

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.graphics.Color
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.Bundle
import android.view.View
import android.widget.Button
import android.widget.FrameLayout
import android.widget.SeekBar
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import io.socket.emitter.Emitter
import org.json.JSONException
import org.json.JSONObject
import top.defaults.colorpicker.ColorPickerView


private const val DEFAULT_PENCIL = 4
private const val DEFAULT_ERASER = 16
private const val DEFAULT_GRID = 2

class FreeGamePage : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private var customCanvas: CanvasView? = null

    //tools
    private lateinit var frame: FrameLayout
    private lateinit var nextWordButton: Button
    private lateinit var gridButton: Button
    private lateinit var redoButton: Button
    private lateinit var undoButton: Button
    private lateinit var eraserButton: Button
    private lateinit var pencilButton: Button
    private lateinit var colorButton: TextView
    private lateinit var colorLayout: ConstraintLayout
    private lateinit var toolsLayout: ConstraintLayout
    private lateinit var gameInfo: ConstraintLayout
    private lateinit var colorPickerView: ColorPickerView
    private lateinit var pickButton: Button
    private lateinit var cancelButton: Button
    private lateinit var currentColor: TextView
    private lateinit var toolText: TextView
    private lateinit var gridText: TextView
    private lateinit var sizeTools: SeekBar
    private lateinit var sizeGrid: SeekBar
    private var lastGridSize = DEFAULT_GRID
    private var lastEraserSize = DEFAULT_ERASER
    private var lastPencilSize = DEFAULT_PENCIL

    //game info
    private lateinit var word: TextView


    private var chosenColor: Int = Color.BLACK
    private var myView: GridView? = null

    var dataName = JSONObject()


    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    @ExperimentalStdlibApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Application.instance?.initAppLanguage(this)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_free_game_page)

        dataName.put("name", SocketInstance.username)
        customCanvas = findViewById(R.id.canva)
        frame = findViewById(R.id.frameCanvas)
        nextWordButton = findViewById(R.id.nextWordButton)
        gridButton = findViewById(R.id.gridButton)
        redoButton = findViewById(R.id.redoButton)
        undoButton = findViewById(R.id.undoButton)
        colorButton = findViewById(R.id.colorButton)
        colorLayout = findViewById(R.id.colorLayout)
        toolsLayout = findViewById(R.id.tools)
        pickButton = findViewById(R.id.pickButton)
        cancelButton = findViewById(R.id.cancelButton)
        colorPickerView = findViewById(R.id.colorPicker)
        currentColor = findViewById(R.id.currentColor)
        sizeTools = findViewById(R.id.sliderTools)
        sizeGrid = findViewById(R.id.sliderGrid)
        eraserButton = findViewById(R.id.eraserButton)
        pencilButton = findViewById(R.id.pencilButton)
        toolText = findViewById(R.id.toolText)
        gridText = findViewById(R.id.gridText)
        word = findViewById(R.id.freegameword)
        gameInfo = findViewById(R.id.gameinfo)

        if (LocaleUtils.selectedThemeId == "dark") {
            val shape: GradientDrawable = toolsLayout.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.darkMode))
            val shapeInfo: GradientDrawable = gameInfo.background as GradientDrawable
            shapeInfo.setColor(resources.getColor(R.color.darkMode))
            word.setTextColor(resources.getColor(R.color.white))
        } else {
            val shape: GradientDrawable = toolsLayout.background as GradientDrawable
            shape.setColor(resources.getColor(R.color.white))
            val shapeInfo: GradientDrawable = gameInfo.background as GradientDrawable
            shapeInfo.setColor(resources.getColor(R.color.white))
            word.setTextColor(resources.getColor(R.color.purple_light))
        }

        gridButton.setOnClickListener {
            gridToggle()
        }
        redoButton.setOnClickListener {
            redo()
        }
        undoButton.setOnClickListener {
            undo()
        }
        colorButton.setOnClickListener {
            colorLayout.visibility = View.VISIBLE
        }
        colorPickerView.subscribe { color, fromUser, shouldPropagate ->
            chosenColor = color
            currentColor.setBackgroundColor(chosenColor)
        }
        pickButton.setOnClickListener {
            colorLayout.visibility = View.GONE
            customCanvas?.setColor(chosenColor)
            colorButton.setBackgroundColor(chosenColor)
        }
        cancelButton.setOnClickListener {
            colorLayout.visibility = View.GONE
        }
        sizeTools.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seek: SeekBar, progress: Int, fromUser: Boolean) {
                customCanvas?.setStrokeWidth(progress)
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        sizeGrid.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {
            override fun onProgressChanged(seek: SeekBar, progress: Int, fromUser: Boolean) {
                updateGrid(progress)
            }

            override fun onStartTrackingTouch(seekBar: SeekBar?) {}
            override fun onStopTrackingTouch(seekBar: SeekBar?) {}
        })

        nextWordButton.setOnClickListener { mSocket?.emit("get_word", dataName) }

        mSocket?.emit("start_gameroom", dataName)

        mSocket?.on("start_gameroom", onStartGameroom)
        mSocket?.on("get_word", onGetWord)
        mSocket?.on("disconnect", onDisconnect)
    }

    @ExperimentalStdlibApi
    fun undo() {
        customCanvas?.undo()
    }

    @ExperimentalStdlibApi
    fun redo() {
        customCanvas?.redo()
    }

    fun quitGame(view: View) {
        mSocket?.emit("game_done", dataName)
        val intent = Intent(this, MainMenu::class.java)
        intent.putExtra("username", SocketInstance.username)
        mSocket?.off("start_gameroom")
        mSocket?.off("get_word")
        mSocket?.off("disconnect")
        startActivity(intent)
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    private fun gridToggle() {
        if (frame.childCount > 0) {
            sizeGrid.visibility = View.GONE
            gridText.visibility = View.GONE
            lastGridSize = sizeGrid.progress
            gridButton.background = ContextCompat.getDrawable(this, R.drawable.grid_off)
            gridButton.backgroundTintList = ContextCompat.getColorStateList(this, R.color.black)
            frame.removeAllViews()

        } else {
            sizeGrid.visibility = View.VISIBLE
            sizeGrid.progress = lastGridSize
            gridText.visibility = View.VISIBLE
            gridButton.background = ContextCompat.getDrawable(this, R.drawable.grid_on)
            gridButton.backgroundTintList =
                ContextCompat.getColorStateList(this, R.color.purple_light)
            myView = GridView(this, lastGridSize)
            frame.addView(myView)

        }
    }

    private fun updateGrid(num: Int) {
        frame.removeAllViews()
        myView = GridView(this, num)
        frame.addView(myView)
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    fun erase(view: View) {
        if (customCanvas?.isErase == false) {
            lastPencilSize = sizeTools.progress
            customCanvas?.setStrokeWidth(lastEraserSize)
            sizeTools.progress = lastEraserSize
            toolText.text = getString(R.string.eraserWidth)
            eraserButton.backgroundTintList =
                ContextCompat.getColorStateList(this, R.color.purple_light)
            pencilButton.backgroundTintList = ContextCompat.getColorStateList(this, R.color.black)
        }
        customCanvas?.isErase = true
    }

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    fun draw(view: View) {
        if (customCanvas?.isErase == true) {
            lastEraserSize = sizeTools.progress
            customCanvas?.setStrokeWidth(lastPencilSize)
            sizeTools.progress = lastPencilSize
            toolText.text = getString(R.string.pencilWidth)
            pencilButton.backgroundTintList =
                ContextCompat.getColorStateList(this, R.color.purple_light)
            eraserButton.backgroundTintList = ContextCompat.getColorStateList(this, R.color.black)
        }
        customCanvas?.isErase = false
    }

    private var onGetWord = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            customCanvas?.clearCanvas()
            runOnUiThread {
                word.text = data["word"].toString()
            }
        } catch (e: JSONException) {
        }
    }

    private var onStartGameroom = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            if (response["code"] == 1) {
                var data = response["data"] as JSONObject
                runOnUiThread(Runnable {
                    word.text = data["word"].toString()
                })
            }
        } catch (e: JSONException) {
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
                    mSocket?.off("start_gameroom")
                    mSocket?.off("get_word")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                })
            dialogBuilder.setOnCancelListener {
                val intent = Intent(this, MainActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                mSocket?.off("start_gameroom")
                mSocket?.off("get_word")
                mSocket?.off("disconnect")
                startActivity(intent)
            }
            val b = dialogBuilder.create()
            b.show()
        }
    }

    override fun onBackPressed() {}
}
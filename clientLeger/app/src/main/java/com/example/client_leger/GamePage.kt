package com.example.client_leger

import android.annotation.SuppressLint
import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.util.DisplayMetrics
import android.view.View
import android.widget.*
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.core.content.ContextCompat
import io.socket.emitter.Emitter
import nl.dionsegijn.konfetti.KonfettiView
import nl.dionsegijn.konfetti.emitters.StreamEmitter
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import top.defaults.colorpicker.ColorPickerView
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


private const val DEFAULT_PENCIL = 4
private const val DEFAULT_ERASER = 16
private const val DEFAULT_GRID = 2

class GamePage : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private var customCanvas: CanvasView? = null
    private var drawingCanvas: DrawingView? = null

    // virtual
    private lateinit var canvasVirt: ImageView
    private lateinit var mBitmap: Bitmap
    private lateinit var mCanvas: Canvas
    private var mPaint = Paint()
    private var pixelsToDraw = 0
    private var startPoint = 0
    private var endPoint = 0
    var ptsArraySVG = ArrayList<String>()
    var ptsArray = JSONArray()
    var table = JSONArray()
    var timerSchedVirt: Timer? = null
    var mPath = Path()
    private var animTimer: CountDownTimer? = null

    //tools
    private lateinit var viewKonfetti: KonfettiView
    private lateinit var frame: FrameLayout
    private lateinit var gridButton: Button
    private lateinit var redoButton: Button
    private lateinit var undoButton: Button
    private lateinit var eraserButton: Button
    private lateinit var pencilButton: Button
    private lateinit var colorButton: TextView
    private lateinit var colorLayout: ConstraintLayout
    private lateinit var toolsLayout: ConstraintLayout
    private lateinit var colorPickerView: ColorPickerView
    private lateinit var gameInfo: ConstraintLayout
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
    private lateinit var gameMode: TextView
    private lateinit var quitButton: TextView
    private lateinit var blackScreen: FrameLayout
    private lateinit var word: TextView
    private lateinit var time: TextView
    private lateinit var gameRound: TextView
    private var round = 1
    private var timer: CountDownTimer? = null

    private lateinit var tries: TextView
    private lateinit var guessingTeam: TextView

    private var chosenColor: Int = Color.BLACK
    private var myView: GridView? = null

    var currentDrawer = ""
    var currentWord = ""
    var insideReplyRight = false

    private lateinit var redplayer1: TextView
    private lateinit var redplayer2: TextView
    private lateinit var redavatar1: ImageView
    private lateinit var redavatar2: ImageView
    private lateinit var redscore: TextView
    private lateinit var blueplayer1: TextView
    private lateinit var blueplayer2: TextView
    private lateinit var blueavatar1: ImageView
    private lateinit var blueavatar2: ImageView
    private lateinit var bluescore: TextView

    var dataName = JSONObject()


    lateinit var dialogBuilder: AlertDialog.Builder

    lateinit var b: AlertDialog

    var redteam = ArrayList<String>()
    var blueteam = ArrayList<String>()
    var redteamavatars = ArrayList<String>()
    var blueteamavatars = ArrayList<String>()
    var guessingTeamArray = ArrayList<String>()
    var redteampts = 0
    var blueteampts = 0


    @SuppressLint("CommitTransaction")
    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    @ExperimentalStdlibApi
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Application.instance?.initAppLanguage(this)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_game_page)

        dataName.put("name", SocketInstance.roomName)
        customCanvas = findViewById(R.id.canva)
        drawingCanvas = findViewById(R.id.canvaView)
        gameMode = findViewById(R.id.gamemode)
        blackScreen = findViewById(R.id.blackScreen)
        frame = findViewById(R.id.frameCanvas)
        gridButton = findViewById(R.id.gridButton)
        redoButton = findViewById(R.id.redoButton)
        undoButton = findViewById(R.id.undoButton)
        colorButton = findViewById(R.id.colorButton)
        colorLayout = findViewById(R.id.colorLayout)
        gameInfo = findViewById(R.id.gameinfo)
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
        word = findViewById(R.id.gameword)
        time = findViewById(R.id.gametime)
        gameRound = findViewById(R.id.gameround)
        tries = findViewById(R.id.tvtries)
        viewKonfetti = findViewById(R.id.viewKonfetti)
        canvasVirt = findViewById(R.id.canvasVirt)

        redscore = findViewById(R.id.tvscore1)
        bluescore = findViewById(R.id.tvscore2)
        blueplayer1 = findViewById(R.id.tvblueplayer1)
        blueplayer2 = findViewById(R.id.tvblueplayer2)
        blueavatar1 = findViewById(R.id.blueavatar1)
        blueavatar2 = findViewById(R.id.blueavatar2)
        redplayer1 = findViewById(R.id.tvredplayer1)
        redplayer2 = findViewById(R.id.tvredplayer2)
        redavatar1 = findViewById(R.id.redavatar1)
        redavatar2 = findViewById(R.id.redavatar2)
        guessingTeam = findViewById(R.id.guessingTeam)
        quitButton = findViewById(R.id.quit)


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

        dialogBuilder = AlertDialog.Builder(this)
        b = dialogBuilder.create()

        gridButton.setOnClickListener {
            gridToggle()
        }
        redoButton.setOnClickListener {
            redo()
        }
        undoButton.setOnClickListener {
            undo()
        }
        quitButton.setOnClickListener {
            mSocket?.emit("quit_game", dataName)
            gameDone()
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

        customCanvas?.visibility = View.GONE
        toolsLayout.visibility = View.GONE
        drawingCanvas?.visibility = View.GONE

        mPaint.isAntiAlias = true
        mPaint.color = Color.BLACK
        mPaint.style = Paint.Style.STROKE
        mPaint.strokeJoin = Paint.Join.ROUND
        mPaint.strokeCap = Paint.Cap.ROUND
        mPaint.strokeWidth = 15f

        redteam = intent.getStringArrayListExtra("redteam")!!
        redteamavatars = intent.getStringArrayListExtra("redteamavatars")!!
        blueteam = intent.getStringArrayListExtra("blueteam")!!
        blueteamavatars = intent.getStringArrayListExtra("blueteamavatars")!!
        guessingTeamArray = blueteam

        var resp = JSONObject(intent.extras?.get("data").toString())
        var answer = resp["data"] as JSONObject
        var message = getString(R.string.remainingTries, answer["tries"])
        tries.text = message
        setLayout(resp)

        transitionTimer()
        setCalendar(answer["startTime"].toString())

        if (intent.extras?.get("isBlind") == true) {
            gameMode.text = getString(R.string.blindMode)
        }

        redplayer1.text = redteam[0]
        var avatarname1 = "avatar${redteamavatars.get(0)}"
        var avatarid1 = this.resources
            .getIdentifier(avatarname1, "drawable", this.packageName)
        redavatar1.setImageResource(avatarid1)

        redplayer2.text = redteam[1]
        var avatarname2 = "avatar${redteamavatars.get(1)}"
        var avatarid2 = this.resources
            .getIdentifier(avatarname2, "drawable", this.packageName)
        redavatar2.setImageResource(avatarid2)

        blueplayer1.text = blueteam[0]
        var avatarname3 = "avatar${blueteamavatars.get(0)}"
        var avatarid3 = this.resources
            .getIdentifier(avatarname3, "drawable", this.packageName)
        blueavatar1.setImageResource(avatarid3)

        blueplayer2.text = blueteam[1]
        var avatarname4 = "avatar${blueteamavatars.get(1)}"
        var avatarid4 = this.resources
            .getIdentifier(avatarname4, "drawable", this.packageName)
        blueavatar2.setImageResource(avatarid4)

        mSocket?.on("drawing_info", onDrawingInfo)
        mSocket?.on("end_line", onEndLine)
        mSocket?.on("next_round", onNextRound)
        mSocket?.on("game_done", onGameDone)
        mSocket?.on("verify_answer", onVerifyAnswer)
        mSocket?.on("reply_right", onReplyRight)
        mSocket?.on("virtual_draw", onVirtualDraw)
        mSocket?.on("disconnect", onDisconnect)
        mSocket?.on("end_gameroom", onEndGameroom)

    }

    private fun setCalendar(date: String) {
        val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.US)
        val dateStart = dateFormat.parse(date)
        val calendar = Calendar.getInstance()
        calendar.time = dateStart
        calendar[Calendar.SECOND] = calendar[Calendar.SECOND] - 3

        transitionTimer()
        var transitionSched = Timer()
        var transitionTask = object : TimerTask() {
            override fun run() {
                animTimer?.start()
            }
        }
        transitionSched.schedule(transitionTask, calendar.time)
    }

    private fun transitionTimer() {
        runOnUiThread {
            animTimer = object : CountDownTimer(3000, 1000) {
                override fun onTick(millisUntilFinished: Long) {
                    val sec = millisUntilFinished / 1000
                    findViewById<TextView>(R.id.anim).text = ("${sec + 1}")
                }

                override fun onFinish() {
                    findViewById<TextView>(R.id.anim).visibility = View.GONE
                }
            }
        }
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
//        var fmChat = supportFragmentManager.findFragmentById(R.id.chatFragment) as RoomsChatFragment
//        fmChat.offListeners()
        val intent = Intent(this, MainMenu::class.java)
        intent.putExtra("username", SocketInstance.username)
        timer = null
        animTimer = null
        timerSchedVirt = null
        mSocket?.off("start_gameroom")
        mSocket?.off("drawing_info")
        mSocket?.off("end_line")
        mSocket?.off("next_round")
        mSocket?.off("game_done")
        mSocket?.off("verify_answer")
        mSocket?.off("end_gameroom")
        mSocket?.off("virtual_draw")
        mSocket?.off("reply_right")
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
            blackScreen.visibility = View.GONE
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

    private var onEndGameroom = Emitter.Listener { args ->
        var message = getString(R.string.endgameroom)
        runOnUiThread {
            showDialog(message, 1)
        }
    }

    @ExperimentalStdlibApi
    private var onDrawingInfo = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            if (response["code"] == 1) {
                var data = response["data"] as JSONArray
                if (currentDrawer != SocketInstance.username) {
                    for (i in 0 until data.length()) {
                        var coord = data.get(i) as JSONObject
                        if (coord["type"].toString() == "undo") {
                            drawingCanvas?.undo()
                        } else if (coord["type"].toString() == "redo") {
                            drawingCanvas?.redo()
                        } else {
                            var positionX = (coord["positionX"] as Int).toFloat()
                            var positionY = (coord["positionY"] as Int).toFloat()
                            var color = Color.parseColor(coord["color"].toString())
                            var width = (coord["width"] as Int).toFloat()
                            drawingCanvas?.draw(positionX, positionY, color, width)
                        }
                    }
                }
            }
        } catch (e: JSONException) {
        }
    }

    private var onVirtualDraw = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            var type = data["type"] as String
            var drawingTime = data["drawing_time"] as Int


            mBitmap = Bitmap.createBitmap(
                findViewById<ConstraintLayout>(R.id.canvasLayout).width,
                findViewById<ConstraintLayout>(R.id.canvasLayout).height, Bitmap.Config.ARGB_8888
            )
            mCanvas = Canvas(mBitmap)

            ptsArray = JSONArray()
            ptsArraySVG = ArrayList<String>()

            var lines = data["lines"] as JSONArray
            if (type == "draw") {
                var array = lines.toString()
                var rep = array.replace("""[$\[\]]""".toRegex(), "")
                var value = "[$rep]"
                table = JSONArray(value)
                pixelsToDraw = table.length() / drawingTime / 10
                if (pixelsToDraw < 1) {
                    pixelsToDraw = 1
                }
                drawOnCanvas()
            } else if (type == "insert") {
                for (i in 0 until lines.length()) {
                    var line = lines.get(i) as JSONArray
                    for (i in 0 until line.length()) {
                        var point = line.get(i) as String
                        ptsArraySVG.add(point)
                    }
                }
                pixelsToDraw = ptsArraySVG.size / drawingTime / 10
                runOnUiThread {
                    var color = Color.parseColor(data["line_color"].toString())
                    var background = Color.parseColor(data["background"].toString())
                    canvasVirt.setBackgroundColor(background)
                    mPaint.color = color
                }
                mPaint.strokeWidth = 1.3333333333f
                drawOnCanvasSVG()
            }
        } catch (e: JSONException) {
        }
    }

    private fun drawOnCanvas() {
        var task = object : TimerTask() {
            override fun run() {
                endPoint += pixelsToDraw
                if (endPoint > table.length() - 1) {
                    endPoint = table.length() - 1
                }
                for (i in startPoint until endPoint) {
                    var pts = table.get(i) as JSONObject
                    var point = pts["point"] as JSONObject
                    var x = ((point["x"] as Int).toDouble() * 1.333).toFloat()
                    var y = ((point["y"] as Int).toDouble() * 1.333).toFloat()
                    mPaint.strokeWidth = 1.3333333f
                    mPaint.color = Color.argb(
                        pts["a"] as Int,
                        pts["r"] as Int,
                        pts["g"] as Int,
                        pts["b"] as Int
                    )
                    mCanvas.drawPoint(x, y, mPaint)
                    runOnUiThread {
                        canvasVirt.setImageBitmap(mBitmap)
                    }
                }
                startPoint += pixelsToDraw
                if (endPoint == table.length() - 1) {
                    timerSchedVirt?.cancel()
                }
            }
        }
        timerSchedVirt = Timer()
        timerSchedVirt?.scheduleAtFixedRate(task, 0, 100)
    }

    private fun drawOnCanvasSVG() {
        var task = object : TimerTask() {
            override fun run() {
                var path = ""
                endPoint += pixelsToDraw
                if (endPoint > ptsArraySVG.size - 1) {
                    endPoint = ptsArraySVG.size - 1
                }
                for (i in startPoint until endPoint) {
                    if (ptsArraySVG.size != 0) {
                        path += ptsArraySVG[i]
                    }
                }
                drawSVG(path)
                startPoint += pixelsToDraw
                if (endPoint == ptsArraySVG.size - 1) {
                    timerSchedVirt?.cancel()
                }
            }
        }
        timerSchedVirt = Timer()
        timerSchedVirt?.scheduleAtFixedRate(task, 0, 100)
    }

    private fun drawSVG(path: String) {
        var commands = path.split("(?=[LMC])".toRegex())
        for (i in 1 until commands.size) {
            var letter = commands[i][0].toString()
            if (letter == "M" || letter == "L") {
                var coord = commands[i].split(" ")
                if (letter == "M") {
                    mPath.moveTo(
                        (coord[1].toDouble() * 1.3333).toFloat(),
                        (coord[2].toDouble() * 1.3333).toFloat()
                    )
                } else if (letter == "L") {
                    mPath.lineTo(
                        (coord[1].toDouble() * 1.3333).toFloat(),
                        (coord[2].toDouble() * 1.3333).toFloat()
                    )
                }

            } else {
                var rem = commands[i].drop(2)
                var coords = rem.split(",")
                var coord1 = coords[0].split(" ")
                var coord2 = coords[1].split(" ")
                var coord3 = coords[2].split(" ")
                mPath.cubicTo(
                    (coord1[0].toDouble() * 1.3333).toFloat(),
                    (coord1[1].toDouble() * 1.3333).toFloat(),
                    (coord2[1].toDouble() * 1.3333).toFloat(),
                    (coord2[2].toDouble() * 1.3333).toFloat(),
                    (coord3[1].toDouble() * 1.3333).toFloat(),
                    (coord3[2].toDouble() * 1.3333).toFloat()
                )
            }
        }
        mCanvas.drawPath(mPath, mPaint)
        runOnUiThread {
            canvasVirt.setImageBitmap(mBitmap)
        }
    }

    private var onEndLine = Emitter.Listener { args ->
        drawingCanvas?.endLine()
    }

    private var onNextRound = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var answer = response["data"] as JSONObject

            insideReplyRight = false
            customCanvas?.clearCanvas()
            drawingCanvas?.clearCanvas()
            customCanvas?.visibility = View.GONE
            drawingCanvas?.visibility = View.GONE
            drawingCanvas?.isFirstCoord = true
            drawingCanvas?.isDone = false
            startPoint = 0
            endPoint = 0
            pixelsToDraw = 0
            mPath = Path()
            mPath.reset()
            round++
            runOnUiThread {
                canvasVirt.setImageDrawable(null)
                canvasVirt.setBackgroundColor(Color.WHITE)
            }

            if (round < 5) {
                var message = getString(R.string.remainingTries, answer["tries"])
                runOnUiThread {
                    gameRound.text = ("round: $round/4")
                    tries.text = message
                    setLayout(response)
                }
            } else {
                if (currentDrawer == SocketInstance.username) {
                    mSocket?.emit("game_done", dataName)
                } else if (currentDrawer.contains("[VIRT]") && SocketInstance.username == SocketInstance.roomName) {
                    mSocket?.emit("game_done", dataName)
                }
            }
        } catch (e: JSONException) {
        }
    }

    private var onGameDone = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var points = response["data"] as JSONObject
            var winner = (points["winner"]).toString()
            round = 1
            runOnUiThread {
                bluescore.text = "0 points"
                redscore.text = "0 points"
            }
            blueteampts = 0
            redteampts = 0
            timer = null
            runOnUiThread {
                b.dismiss()
                if (winner == "red") {
                    if (redteam.contains(SocketInstance.username)) {
                        confetti()
                        stopConfetti()
                    } else {
                        var message = getString(R.string.gameDone, winner)
                        showDialog(message, 1)
                    }
                } else if (winner == "blue") {
                    if (blueteam.contains(SocketInstance.username)) {
                        confetti()
                        stopConfetti()
                    } else {
                        var message = getString(R.string.gameDone, winner)
                        showDialog(message, 1)
                    }
                } else {
                    var message = getString(R.string.gameDoneEqual)
                    showDialog(message, 1)
                }
            }
        } catch (e: JSONException) {
        }
    }

    private fun confetti() {
        val display = DisplayMetrics()
        windowManager.defaultDisplay.getMetrics(display)
        viewKonfetti.build()
            .addColors(Color.YELLOW, Color.GREEN, Color.MAGENTA)
            .setDirection(0.0, 359.0)
            .setSpeed(1f, 5f)
            .setFadeOutEnabled(true)
            .setTimeToLive(2000L)
            .addShapes(
                nl.dionsegijn.konfetti.models.Shape.Square,
                nl.dionsegijn.konfetti.models.Shape.Circle
            )
            .addSizes(nl.dionsegijn.konfetti.models.Size(12))
            .setPosition(-50f, display.widthPixels + 50f, -50f, -50f)
            .streamFor(300, StreamEmitter.INDEFINITE)
    }

    private fun stopConfetti() {
        var timerSched = Timer()
        var task = object : TimerTask() {
            override fun run() {
                gameDone()
            }
        }

        timerSched.schedule(task, 5000)
    }

    private var onVerifyAnswer = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var answer = response["data"] as JSONObject
            var message = getString(R.string.remainingTries, answer["tries"])
            var isValid = answer["is_valid"] as Boolean
            var isReplyRight = answer["is_reply_right"] as Boolean
            runOnUiThread {
                tries.text = message

                if (isValid) {
                    mSocket?.emit("end_line", dataName)
                    drawingCanvas?.visibility = View.GONE
                    customCanvas?.visibility = View.GONE
                    b.dismiss()
                    timer?.cancel()
                    timerSchedVirt?.cancel()
                    val ring: MediaPlayer = MediaPlayer.create(
                        this,
                        resources.getIdentifier("correct_answer", "raw", packageName)
                    )
                    ring.start()
                    runOnUiThread {
                        canvasVirt.setImageDrawable(null)
                        canvasVirt.setBackgroundColor(Color.TRANSPARENT)
                    }
                    var message = getString(R.string.answerFound) + "\n" + getString(
                        R.string.roundDone,
                        currentWord
                    )
                    showDialog(message, 2)

                    if (isReplyRight) {
                        if (redteam.contains(currentDrawer)) {
                            blueteampts++
                            bluescore.text = "$blueteampts points"
                        } else {
                            redteampts++
                            redscore.text = "$redteampts points"
                        }

                    } else {
                        if (redteam.contains(currentDrawer)) {
                            redteampts++
                            redscore.text = "$redteampts points"
                        } else {
                            blueteampts++
                            bluescore.text = "$blueteampts points"
                        }
                    }

                    if (currentDrawer == SocketInstance.username) {
                        mSocket?.emit("next_round", dataName)
                    } else if (currentDrawer.contains("[VIRT]") && SocketInstance.username == SocketInstance.roomName) {
                        mSocket?.emit("next_round", dataName)
                    }

                } else if (answer["tries"] == 0) {
                    timer?.cancel()
                    timer?.onFinish()
                }
            }
        } catch (e: JSONException) {
        }
    }
    private var onReplyRight = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var info = response["data"] as JSONObject
            insideReplyRight = true
            val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.US)
            val dateStart = dateFormat.parse(info["startTime"].toString())
            val dateEnd = dateFormat.parse(info["endTime"].toString())
            val timeDiff = dateEnd.time - dateStart.time
            runOnUiThread {
                b.dismiss()
                showDialog(getString(R.string.replyRight), 2)
                setGuessingTeam()
                setHintVisibility()
                var message = getString(R.string.remainingTries, "1")
                tries.text = message
                setTimer(timeDiff)
            }
            var timerSched = Timer()
            var task = object : TimerTask() {
                override fun run() {
                    startTimer()
                }
            }
            timerSched.schedule(task, dateStart)
        } catch (e: JSONException) {
        }
    }

    private fun setLayout(response: JSONObject) {
        try {
            var info = response["data"] as JSONObject
            var gameWord = ""
            currentDrawer = info["drawer"].toString()
            currentWord = info["word"].toString()
            toolsLayout.visibility = View.GONE
            drawingCanvas?.visibility = View.GONE
            customCanvas?.visibility = View.GONE
            canvasVirt.visibility = View.GONE
            blackScreen.visibility = View.GONE
            setGuessingTeam()
            setHintVisibility()
            if (info["drawer"] == SocketInstance.username) {
                gameWord = info["word"].toString()
                toolsLayout.visibility = View.VISIBLE
                canvasVirt.visibility = View.GONE

                if (intent.extras?.get("isBlind") == true) {
                    blackScreen.visibility = View.VISIBLE
                }
            } else if (currentDrawer.contains("[VIRT]")) {
                canvasVirt.visibility = View.VISIBLE
                for (i in info["word"].toString().indices) {
                    gameWord += "_ "
                }
            } else {
                drawingCanvas?.visibility = View.VISIBLE
                for (i in info["word"].toString().indices) {
                    gameWord += "_ "
                }
            }
            val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.US)
            val dateStart = dateFormat.parse(info["startTime"].toString())
            val dateEnd = dateFormat.parse(info["endTime"].toString())
            val timeDiff = dateEnd.time - dateStart.time
            word.text = gameWord
            setTimer(timeDiff)

            var timerSched = Timer()
            var task = object : TimerTask() {
                override fun run() {
                    startTimer()
                }
            }
            timerSched.schedule(task, dateStart)
        } catch (e: JSONException) {
        }
    }

    private fun setGuessingTeam() {
        if (!insideReplyRight) {
            if (redteam.contains(currentDrawer)) {
                guessingTeam.text = getString(R.string.guessingTeam, getString(R.string.red))
                guessingTeamArray = redteam
            } else {
                guessingTeam.text = getString(R.string.guessingTeam, getString(R.string.blue))
                guessingTeamArray = blueteam
            }
        } else {
            if (redteam.contains(currentDrawer)) {
                guessingTeam.text = getString(R.string.guessingTeam, getString(R.string.blue))
                guessingTeamArray = blueteam
            } else {
                guessingTeam.text = getString(R.string.guessingTeam, getString(R.string.red))
                guessingTeamArray = redteam

            }
        }
    }

    private fun setHintVisibility() {
        var fm = supportFragmentManager.findFragmentById(R.id.chatFragment) as RoomsChatFragment
        if (currentDrawer.contains("[VIRT]") && guessingTeamArray.contains(SocketInstance.username)) {
            runOnUiThread {
                fm.activateHint()
            }
        } else {
            fm.disableHint()
        }
    }

    private fun startTimer() {
        runOnUiThread(Runnable {
            if (currentDrawer == SocketInstance.username) {
                customCanvas?.visibility = View.VISIBLE
            }
            b.dismiss()
            timer?.start()
        })
    }

    private fun setTimer(timeCount: Long) {
        var timeC = timeCount
        time.text = ("${timeC / 1000} sec")
        timer = null
        timer = object : CountDownTimer(timeC, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                var sec = millisUntilFinished / 1000
                time.text = ("$sec sec")
            }

            override fun onFinish() {
                showDialog(getString(R.string.roundDone, currentWord), 2)
                if (currentDrawer == SocketInstance.username) {
                    customCanvas?.visibility = View.GONE
                    toolsLayout.visibility = View.GONE
                    drawingCanvas?.visibility = View.VISIBLE

                    if (!insideReplyRight) {
                        mSocket?.emit("reply_right", dataName)
                    } else {
                        mSocket?.emit("next_round", dataName)
                    }
                } else if (currentDrawer.contains("[VIRT]") && SocketInstance.username == SocketInstance.roomName) {
                    if (!insideReplyRight) {
                        mSocket?.emit("reply_right", dataName)
                    } else {
                        mSocket?.emit("next_round", dataName)
                    }
                }
            }
        }
    }

    private fun showDialog(message: String, code: Int) {
        dialogBuilder = AlertDialog.Builder(this)
        dialogBuilder.setMessage(message)
        if (code == 1) {
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton ->
                    gameDone()
                })
            dialogBuilder.setCancelable(false)
        } else if (code == 2) {
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton ->
                })
        }
        b = dialogBuilder.create()
        b.show()
    }

    private fun gameDone() {
        viewKonfetti.stopGracefully()
        val intent = Intent(this, MainMenu::class.java)
        timer = null
        animTimer = null
        timerSchedVirt = null
        mSocket?.off("start_gameroom")
        mSocket?.off("drawing_info")
        mSocket?.off("end_line")
        mSocket?.off("next_round")
        mSocket?.off("game_done")
        mSocket?.off("verify_answer")
        mSocket?.off("virtual_draw")
        mSocket?.off("reply_right")
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
                    timer = null
                    animTimer = null
                    timerSchedVirt = null
                    mSocket?.off("start_gameroom")
                    mSocket?.off("end_gameroom")
                    mSocket?.off("drawing_info")
                    mSocket?.off("end_line")
                    mSocket?.off("next_round")
                    mSocket?.off("game_done")
                    mSocket?.off("verify_answer")
                    mSocket?.off("virtual_draw")
                    mSocket?.off("reply_right")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                })
            dialogBuilder.setOnCancelListener {
                val intent = Intent(this, MainActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                timer = null
                animTimer = null
                timerSchedVirt = null
                mSocket?.off("start_gameroom")
                mSocket?.off("end_gameroom")
                mSocket?.off("drawing_info")
                mSocket?.off("end_line")
                mSocket?.off("next_round")
                mSocket?.off("game_done")
                mSocket?.off("verify_answer")
                mSocket?.off("virtual_draw")
                mSocket?.off("reply_right")
                mSocket?.off("disconnect")
                startActivity(intent)
            }
            val b = dialogBuilder.create()
            b.show()
        }
    }

    override fun onBackPressed() {}
}
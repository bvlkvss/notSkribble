package com.example.client_leger

import android.app.AlertDialog
import android.content.DialogInterface
import android.content.Intent
import android.graphics.*
import android.graphics.drawable.GradientDrawable
import android.media.MediaPlayer
import android.os.Build
import android.os.Bundle
import android.os.CountDownTimer
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.annotation.RequiresApi
import androidx.appcompat.app.AppCompatActivity
import androidx.constraintlayout.widget.ConstraintLayout
import io.socket.emitter.Emitter
import org.json.JSONArray
import org.json.JSONException
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*
import kotlin.collections.ArrayList


class SoloGamePage : AppCompatActivity() {

    var mSocket = SocketInstance.getMSocket()
    private lateinit var drawingCanvas: ImageView
    private lateinit var drawing: ConstraintLayout
    private lateinit var gameInfo: ConstraintLayout
    lateinit var startButton: Button
    lateinit var quitButton: TextView
    lateinit var playername: TextView
    lateinit var playeravatar: ImageView
    lateinit var word: TextView
    private lateinit var tries: TextView
    private lateinit var wordsGuessed: TextView
    private lateinit var points: TextView
    private lateinit var time: TextView
    private lateinit var mBitmap: Bitmap
    private lateinit var mCanvas: Canvas
    private var mPaint = Paint()
    private var pixelsToDraw = 0
    private var startPoint = 0
    private var endPoint = 0

    private var timer: CountDownTimer? = null
    var ptsArraySVG = ArrayList<String>()
    var dataName = JSONObject()
    var ptsArray = JSONArray()
    var table = JSONArray()
    var timerSched: Timer? = null
    var mPath = Path()
    var timeToAdd = 0L
    var secondsLeft = 0L
    var wordToGuess = ""
    var wordsCounter = 0
    var pointCounter = 0

    @RequiresApi(Build.VERSION_CODES.LOLLIPOP)
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        if (LocaleUtils.selectedThemeId == "dark") {
            setTheme(R.style.Theme_Client_leger_DARK)
        }
        setContentView(R.layout.activity_solo_game_page)

        drawingCanvas = findViewById(R.id.canvaView)
        drawing = findViewById(R.id.canvasLayout)
        startButton = findViewById(R.id.startButton)
        time = findViewById(R.id.gametime)
        word = findViewById(R.id.gameword)
        tries = findViewById(R.id.tvtries)
        wordsGuessed = findViewById(R.id.wordsGuessed)
        points = findViewById(R.id.tvscore)
        quitButton = findViewById(R.id.quitSolo)
        gameInfo = findViewById(R.id.gameinfo)
        playername = findViewById(R.id.tvplayer)
        playeravatar = findViewById(R.id.ivavatar)

        if (LocaleUtils.selectedThemeId == "dark") {
            val shapeInfo: GradientDrawable = gameInfo.background as GradientDrawable
            shapeInfo.setColor(resources.getColor(R.color.darkMode))
            word.setTextColor(resources.getColor(R.color.white))
        } else {
            val shapeInfo: GradientDrawable = gameInfo.background as GradientDrawable
            shapeInfo.setColor(resources.getColor(R.color.white))
            word.setTextColor(resources.getColor(R.color.purple_light))
        }

        playername.text = SocketInstance.username
        var avatarid = this.resources
            .getIdentifier(SocketInstance.useravatar, "drawable", this.packageName)

        playeravatar.setImageResource(avatarid)

        mPaint.isAntiAlias = true
        mPaint.color = Color.BLACK
        mPaint.style = Paint.Style.STROKE
        mPaint.strokeJoin = Paint.Join.ROUND
        mPaint.strokeCap = Paint.Cap.ROUND
        mPaint.strokeWidth = 15f


        var wordsTotal = getString(R.string.wordsGuessed, wordsCounter.toString())
        wordsGuessed.text = wordsTotal

        dataName.put("name", SocketInstance.username)

        startButton.setOnClickListener {
            mSocket?.emit("start_gameroom", dataName)
        }

        quitButton.setOnClickListener {
            mSocket?.emit("quit_game", dataName)
            closeSoloPage()
        }


        mSocket?.on("start_gameroom", onStartGameroom)
        mSocket?.on("verify_answer", onVerifyAnswer)
        mSocket?.on("next_round", onNextRound)
        mSocket?.on("virtual_draw", onVirtualDraw)
        mSocket?.on("disconnect", onDisconnect)
    }


    private var onStartGameroom = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject

            wordsCounter++
            var wordsTotal = getString(R.string.wordsGuessed, wordsCounter.toString())
            var triesLeft = getString(R.string.remainingTries, data["tries"])
            var wordindices = ""
            val dateFormat = SimpleDateFormat("MMM dd, yyyy HH:mm:ss", Locale.US)
            val dateStart = dateFormat.parse(data["startTime"].toString())
            val dateEnd = dateFormat.parse(data["endTime"].toString())
            val timeDiff = dateEnd.time - dateStart.time
            wordToGuess = data["word"] as String
            for (i in wordToGuess.indices) {
                wordindices += "_ "
            }
            runOnUiThread {
                startButton.isEnabled = false
                wordsGuessed.text = wordsTotal
                tries.text = triesLeft

                word.text = wordindices

                setTimer(timeDiff)
                var timerSched = Timer()
                var task = object : TimerTask() {
                    override fun run() {
                        startTimer()
                    }
                }
                timerSched.schedule(task, dateStart)
            }
        } catch (e: JSONException) {
        }
    }

    private var onVerifyAnswer = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            var message = getString(R.string.remainingTries, data["tries"])
            runOnUiThread {
                tries.text = message
            }

            timeToAdd = (data["time"] as Int).toLong()
            var isValid = data["is_valid"] as Boolean

            if (isValid) {
                pointCounter++
                val ring: MediaPlayer = MediaPlayer.create(
                    this,
                    resources.getIdentifier("correct_answer", "raw", packageName)
                )
                ring.start()
                var newTime = (timeToAdd + secondsLeft) * 1000
                runOnUiThread {
                    points.text = "$pointCounter points"
                    timer?.cancel()
                    timerSched?.cancel()
                    setTimer(newTime)
                    startTimer()
                }
                mSocket?.emit("next_round", dataName)
            }
            if (data["tries"] == 0) {
                mSocket?.emit("next_round", dataName)
            }
        } catch (e: JSONException) {
        }
    }

    private var onNextRound = Emitter.Listener { args ->
        try {
            var response = args[0] as JSONObject
            var data = response["data"] as JSONObject
            wordsCounter++
            mPath = Path()
            var wordsTotal = getString(R.string.wordsGuessed, wordsCounter.toString())
            startPoint = 0
            endPoint = 0
            pixelsToDraw = 0
            mPath.reset()

            wordToGuess = data["word"] as String
            runOnUiThread {
                drawingCanvas.setBackgroundColor(Color.WHITE)
            }
            var message = getString(R.string.remainingTries, data["tries"])

            var wordindices = ""
            for (i in wordToGuess.indices) {
                wordindices += "_ "
            }

            runOnUiThread {
                drawingCanvas.setImageDrawable(null)
                wordsGuessed.text = wordsTotal
                tries.text = message
                word.text = wordindices
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

            mBitmap = Bitmap.createBitmap(drawing.width, drawing.height, Bitmap.Config.ARGB_8888)
            mCanvas = Canvas(mBitmap)

            ptsArray = JSONArray()
            ptsArraySVG = ArrayList<String>()


            var lines = data["lines"] as JSONArray

            table = JSONArray()

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
                if (pixelsToDraw < 1) {
                    pixelsToDraw = 1
                }
                runOnUiThread {
                    var color = Color.parseColor(data["line_color"].toString())
                    var background = Color.parseColor(data["background"].toString())
                    drawingCanvas.setBackgroundColor(background)
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
                try {
                    for (i in startPoint until endPoint) {
                        var pts = table.get(i) as JSONObject
                        var point = pts["point"] as JSONObject
                        var x = ((point["x"] as Int).toDouble() * 1.333).toFloat()
                        var y = ((point["y"] as Int).toDouble() * 1.333).toFloat()
                        mPaint.strokeWidth = 1.3333f
                        mPaint.color = Color.argb(
                            pts["a"] as Int,
                            pts["r"] as Int,
                            pts["g"] as Int,
                            pts["b"] as Int
                        )
                        mCanvas.drawPoint(x, y, mPaint)
                        runOnUiThread {
                            drawingCanvas.setImageBitmap(mBitmap)
                        }
                    }
                } catch (e: JSONException) {
                }
                startPoint += pixelsToDraw
                if (endPoint == table.length() - 1) {
                    timerSched?.cancel()
                }
            }
        }
        timerSched = Timer()
        timerSched?.scheduleAtFixedRate(task, 0, 100)
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
                    timerSched?.cancel()
                }
            }
        }
        timerSched = Timer()
        timerSched?.scheduleAtFixedRate(task, 0, 100)
    }

    private fun drawSVG(path: String) {
        var commands = path.split("(?=[LMC])".toRegex())
        for (i in 1 until commands.size) {
            var letter = commands[i][0].toString()
            if (letter == "M" || letter == "L") {
                var coord = commands[i].split(" ")
                if (letter == "M") {
                    mPath.moveTo(
                        ((coord[1].toDouble()) * 1.3333).toFloat(),
                        ((coord[2].toDouble()) * 1.3333).toFloat()
                    )
                } else {
                    mPath.lineTo(
                        ((coord[1].toDouble()) * 1.3333).toFloat(),
                        ((coord[2].toDouble()) * 1.3333).toFloat()
                    )
                }

            } else {
                var rem = commands[i].drop(2)
                var coords = rem.split(",")
                var coord1 = coords[0].split(" ")
                var coord2 = coords[1].split(" ")
                var coord3 = coords[2].split(" ")
                mPath.cubicTo(
                    ((coord1[0].toDouble()) * 1.3333).toFloat(),
                    ((coord1[1].toDouble()) * 1.3333).toFloat(),
                    ((coord2[1].toDouble()) * 1.3333).toFloat(),
                    ((coord2[2].toDouble()) * 1.3333).toFloat(),
                    ((coord3[1].toDouble()) * 1.3333).toFloat(),
                    ((coord3[2].toDouble()) * 1.3333).toFloat()
                )
            }
        }
        mCanvas.drawPath(mPath, mPaint)
        runOnUiThread {
            drawingCanvas.setImageBitmap(mBitmap)
        }
    }

    private fun startTimer() {
        timer?.start()
    }

    private fun setTimer(timeCount: Long) {
        var timeC = timeCount
        time.text = ("${timeC / 1000} sec")
        timer = null
        timer = object : CountDownTimer(timeC, 1000) {
            override fun onTick(millisUntilFinished: Long) {
                secondsLeft = millisUntilFinished / 1000
                time.text = ("$secondsLeft sec")
            }

            override fun onFinish() {
                wordsCounter = 0
                mSocket?.emit("game_done", dataName)
                showDialogueEnd()
            }
        }
    }

    private fun showDialogueEnd(){
        val dialogBuilder = AlertDialog.Builder(this)
        dialogBuilder.setMessage(R.string.gameDoneCoopSolo)
        dialogBuilder.setPositiveButton("OK",
            DialogInterface.OnClickListener { dialog, whichButton ->
                closeSoloPage()
            })
        dialogBuilder.setCancelable(false)
        val b = dialogBuilder.create()
        b.show()
    }

    private val onDisconnect = Emitter.Listener { args ->
        runOnUiThread {
            val dialogBuilder = AlertDialog.Builder(this)
            dialogBuilder.setMessage(getString(R.string.serverDown))
            dialogBuilder.setPositiveButton("OK",
                DialogInterface.OnClickListener { dialog, whichButton ->
                    val intent = Intent(this, MainActivity::class.java)
                    intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                    timer = null
                    timerSched = null
                    mSocket?.off("start_gameroom")
                    mSocket?.off("end_gameroom")
                    mSocket?.off("verify_answer")
                    mSocket?.off("next_round")
                    mSocket?.off("virtual_draw")
                    mSocket?.off("disconnect")
                    startActivity(intent)
                })
            dialogBuilder.setOnCancelListener {
                val intent = Intent(this, MainActivity::class.java)
                intent.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                timer = null
                timerSched = null
                mSocket?.off("start_gameroom")
                mSocket?.off("end_gameroom")
                mSocket?.off("verify_answer")
                mSocket?.off("next_round")
                mSocket?.off("virtual_draw")
                mSocket?.off("disconnect")
                startActivity(intent)
            }
            val b = dialogBuilder.create()
            b.show()
        }
    }

    private fun closeSoloPage() {
        val intent = Intent(this, MainMenu::class.java)
        timer = null
        timerSched = null
        mSocket?.off("start_gameroom")
        mSocket?.off("end_gameroom")
        mSocket?.off("verify_answer")
        mSocket?.off("next_round")
        mSocket?.off("virtual_draw")
        mSocket?.off("disconnect")
        startActivity(intent)
    }
}
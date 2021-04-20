package com.example.client_leger

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.MotionEvent
import android.view.View
import org.json.JSONArray
import org.json.JSONObject


class CanvasView(context: Context, attrs: AttributeSet?) : View(context, attrs) {

    var isErase = false
    var mBitmap: Bitmap? = null
    private var mCanvas: Canvas? = null
    private var mPath: Path = Path()
    private var paths = ArrayList<Path>()
    private var undonePaths = ArrayList<Path>()
    private var colorsMap: HashMap<Path, Int?> = HashMap()
    private var widthMap: HashMap<Path, Float> = HashMap()
    private val mPaint: Paint = Paint()
    private var currentColor: Int = Color.BLACK
    private var previousColor: Int = Color.BLACK
    private var width: Float = 4f
    private var mX = 0f
    private var mY = 0f
    var mSocket = SocketInstance.getMSocket()


    var pixels = JSONArray()


    override fun onSizeChanged(w: Int, h: Int, oldw: Int, oldh: Int) {
        super.onSizeChanged(w, h, oldw, oldh)

        mBitmap = Bitmap.createBitmap(w, h, Bitmap.Config.ARGB_8888)
        mCanvas = Canvas(mBitmap!!)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        for (p in paths) {
            mPaint.color = colorsMap[p]!!
            mPaint.strokeWidth = widthMap[p]!!
            canvas.drawPath(p, mPaint)
        }
        mPaint.strokeWidth = width
        mPaint.color = currentColor
        canvas.drawPath(mPath, mPaint)
    }

    private fun startTouch(x: Float, y: Float) {
        mPath.moveTo(x, y)
        mX = x
        mY = y
    }

    private fun moveTouch(x: Float, y: Float) {
        val dx = Math.abs(x - mX)
        val dy = Math.abs(y - mY)
        if (dx >= TOLERANCE || dy >= TOLERANCE) {
            mPath.quadTo(mX, mY, (x + mX) / 2, (y + mY) / 2)
            mX = x
            mY = y
        }
    }

    @ExperimentalStdlibApi
    fun undo() {
        if (paths.size > 0) {
            undonePaths.add(paths[paths.size - 1])
            paths.removeLast()
            invalidate()

        }
        var data = JSONObject()
        var pixel = JSONObject()
        pixel.put("type", "undo")


        pixels.put(pixel)
        data.put("name", SocketInstance.roomName)
        data.put("info", pixels)
        mSocket?.emit("drawing_info", data)
        pixels = JSONArray()
    }

    @ExperimentalStdlibApi
    fun redo() {
        if (undonePaths.size > 0) {
            paths.add(undonePaths[undonePaths.size - 1])
            undonePaths.removeLast()
            invalidate()

        }
        var data = JSONObject()
        var pixel = JSONObject()
        pixel.put("type", "redo")
        pixels.put(pixel)

        data.put("name", SocketInstance.roomName)
        data.put("info", pixels)
        mSocket?.emit("drawing_info", data)
        pixels = JSONArray()
    }

    fun clearCanvas() {
        mPath.reset()
        paths.clear()
        colorsMap.clear()
        widthMap.clear()
        invalidate()
    }

    private fun upTouch() {
        mPath.lineTo(mX, mY)
        paths.add(mPath)
        colorsMap[mPath] = currentColor
        widthMap[mPath] = width
        mPath = Path()
    }

    override fun onTouchEvent(event: MotionEvent): Boolean {

        val x = event.x
        val y = event.y
        var pixel = JSONObject()

        var colorToSend = "#" + java.lang.Integer.toHexString(currentColor)


        pixel.put("positionX", (x / 1.33).toInt())
        pixel.put("positionY", (y / 1.33).toInt())
        pixel.put("color", colorToSend)
        pixel.put("width", width)

        if (isErase) {
            pixel.put("type", "eraser")
        } else {
            pixel.put("type", "pencil")
        }

        when (event.action) {
            MotionEvent.ACTION_DOWN -> {
                startTouch(x, y)
                invalidate()

                pixel.put("isDone", false)
                pixels.put(pixel)

                var data = JSONObject()
                data.put("name", SocketInstance.roomName)
                data.put("info", pixels)

                mSocket?.emit("drawing_info", data)

                pixels = JSONArray()
            }
            MotionEvent.ACTION_MOVE -> {

                if (isErase) {
                    currentColor = Color.WHITE
                } else {
                    currentColor = previousColor
                    undonePaths.clear()
                }
                moveTouch(x, y)
                invalidate()

                pixel.put("isDone", false)
                pixels.put(pixel)

                var data = JSONObject()
                data.put("name", SocketInstance.roomName)
                data.put("info", pixels)

                mSocket?.emit("drawing_info", data)

                pixels = JSONArray()
            }
            MotionEvent.ACTION_UP -> {
                upTouch()
                invalidate()


                pixel.put("isDone", true)

                var endlinedata = JSONObject()

                endlinedata.put("name", SocketInstance.roomName)
                if (isErase) {
                    endlinedata.put("type", "eraser")
                } else {
                    endlinedata.put("type", "pencil")
                }
                mSocket?.emit("end_line", endlinedata)
            }
        }

        return true
    }

    companion object {
        private const val TOLERANCE = 5f
    }

    fun setColor(color: Int) {
        currentColor = color
        previousColor = color
    }

    fun setStrokeWidth(newWidth: Int) {
        width = newWidth.toFloat()
    }

    init {
        mPaint.isAntiAlias = true
        mPaint.color = Color.BLACK
        mPaint.style = Paint.Style.STROKE
        mPaint.strokeJoin = Paint.Join.ROUND
        mPaint.strokeCap = Paint.Cap.ROUND
        mPaint.strokeWidth = 4f
    }
}
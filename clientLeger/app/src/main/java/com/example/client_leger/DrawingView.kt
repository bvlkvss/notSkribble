package com.example.client_leger

import android.content.Context
import android.graphics.*
import android.util.AttributeSet
import android.view.View
import org.json.JSONObject


class DrawingView(context: Context, attrs: AttributeSet?) : View(context, attrs) {

    var mBitmap: Bitmap? = null
    private var mCanvas: Canvas? = null
    var isFirstCoord = true
    var isDone = false
    private var mPath: Path = Path()
    private var paths = ArrayList<Path>()
    private var colorsMap: HashMap<Path, Int?> = HashMap()
    private var widthMap: HashMap<Path, Float> = HashMap()
    private var undonePaths = ArrayList<Path>()
    var mPaint: Paint = Paint()
    private var currentColor = Color.BLACK
    private var currentWidth = 4F
    private var mX = 0f
    private var mY = 0f

    var isFirstUndo: Boolean = true

    var savedX = 0f
    var savedY = 0f
    var savedColor = 0
    var savedWidth = 0f


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
        mPaint.strokeWidth = currentWidth
        mPaint.color = currentColor
        canvas.drawPath(mPath, mPaint)
    }

    fun start(x: Float, y: Float) {
        mPath.moveTo(x, y)
        mX = x
        mY = y
    }

    fun move(x: Float, y: Float) {
        val dx = Math.abs(x - mX)
        val dy = Math.abs(y - mY)
        if (dx >= DrawingView.TOLERANCE || dy >= DrawingView.TOLERANCE) {
            mPath.quadTo(mX, mY, (x + mX) / 2, (y + mY) / 2)
            mX = x
            mY = y
        }
        invalidate()
    }

    fun addCoord(x: Float, y: Float, color: Int, width: Float) {
        mPath.lineTo(x, y)
        paths.add(mPath)
        colorsMap[mPath] = color
        widthMap[mPath] = width
        mPath = Path()
        invalidate()
    }

    fun draw(x: Float, y: Float, color: Int, width: Float) {
        undonePaths.clear()
        var positionx = (x * 1.33).toFloat()
        var positiony = (y * 1.33).toFloat()


        currentColor = color
        currentWidth = width

        if (isFirstCoord) {
            if (isDone) {
                addCoord(savedX, savedY, savedColor, savedWidth)
                isDone = false
            }
            start(positionx, positiony)
            isFirstCoord = false
        } else {
            move(positionx, positiony)
        }
    }

    fun endLine() {
        isDone = true
        isFirstCoord = true
        isFirstUndo = true
        savedX = mX
        savedY = mY
        savedColor = currentColor
        savedWidth = currentWidth

    }

    companion object {
        private const val TOLERANCE = 5f
    }

    @ExperimentalStdlibApi
    fun undo() {
        if (isFirstUndo) {
            addCoord(savedX, savedY, savedColor, savedWidth)
            isDone = false
            isFirstUndo = false
        }
        if (paths.size > 0) {
            undonePaths.add(paths[paths.size - 1])
            paths.removeLast()
            invalidate()
        }
    }

    @ExperimentalStdlibApi
    fun redo() {
        if (undonePaths.size > 0) {
            paths.add(undonePaths[undonePaths.size - 1])
            undonePaths.removeLast()
            invalidate()
        }
    }


    init {
        mPaint.isAntiAlias = true
        mPaint.color = Color.BLACK
        mPaint.style = Paint.Style.STROKE
        mPaint.strokeJoin = Paint.Join.ROUND
        mPaint.strokeCap = Paint.Cap.ROUND
        mPaint.strokeWidth = 4f
    }

    fun clearCanvas() {
        mPath.reset()
        paths.clear()
        colorsMap.clear()
        widthMap.clear()

        invalidate()
    }
}
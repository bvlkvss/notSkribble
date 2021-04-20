package com.example.client_leger

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.util.TypedValue
import android.view.View
import androidx.annotation.Nullable


class GridView(context: Context, @Nullable attrs: AttributeSet?) : View(context, attrs) {

    var horizontalGridCount = 2
    private val horizontalLines: Drawable
    private val verticalLines: Drawable
    private val width: Float

    constructor(context: Context, num: Int) : this(context, null) {
        horizontalGridCount = num
    }

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        horizontalLines.setBounds(left, 0, right, width.toInt())
        verticalLines.setBounds(0, top, width.toInt(), bottom)
    }

    private fun getLinePosition(lineNumber: Int): Float {
        val lineCount = horizontalGridCount
        return 1f / (lineCount + 1) * (lineNumber + 1f)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        val count = horizontalGridCount
        for (n in 0 until count) {
            val pos = getLinePosition(n)

            canvas.translate(0F, pos * height)
            horizontalLines.draw(canvas)
            canvas.translate(0F, -pos * height)

            canvas.translate(pos * getWidth(), 0F)
            verticalLines.draw(canvas)
            canvas.translate(-pos * getWidth(), 0F)
        }
    }

    init {
        horizontalLines = ColorDrawable(Color.BLACK)
        horizontalLines.alpha = 160
        verticalLines = ColorDrawable(Color.BLACK)
        verticalLines.alpha = 160
        width = TypedValue.applyDimension(
            TypedValue.COMPLEX_UNIT_DIP,
            0.9f,
            context.resources.displayMetrics
        )
    }
}
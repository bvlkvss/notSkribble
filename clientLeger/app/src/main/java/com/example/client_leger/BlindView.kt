package com.example.client_leger

import android.content.Context
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.ColorDrawable
import android.graphics.drawable.Drawable
import android.util.AttributeSet
import android.view.View
import androidx.annotation.Nullable


class BlindView(context: Context, @Nullable attrs: AttributeSet?) : View(context, attrs) {

    private val horizontalLines: Drawable

    constructor(context: Context) : this(context, null)

    override fun onLayout(changed: Boolean, left: Int, top: Int, right: Int, bottom: Int) {
        super.onLayout(changed, left, top, right, bottom)
        horizontalLines.setBounds(0, 0, width, height)
    }

    override fun onDraw(canvas: Canvas) {
        super.onDraw(canvas)
        horizontalLines.draw(canvas)
    }

    init {
        horizontalLines = ColorDrawable(Color.BLACK)
    }
}
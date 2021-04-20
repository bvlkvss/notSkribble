package com.example.client_leger

import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.Fragment

class TutorialFragment : Fragment() {

    private lateinit var page1: ConstraintLayout
    private lateinit var page2: ConstraintLayout
    private lateinit var page3: ConstraintLayout
    private lateinit var page4: ConstraintLayout
    private lateinit var page5: ConstraintLayout
    private lateinit var page6: ConstraintLayout
    private lateinit var page7: ConstraintLayout
    private lateinit var page8: ConstraintLayout
    private lateinit var page9: ConstraintLayout
    private lateinit var page10: ConstraintLayout
    private lateinit var page11: ConstraintLayout
    private lateinit var page12: ConstraintLayout
    private lateinit var pageend: ConstraintLayout
    private lateinit var background: ConstraintLayout

    var pagesArray = ArrayList<ConstraintLayout>()
    var pagePosition = 0

    private lateinit var nextButton: Button
    private lateinit var backButton: Button

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        var v = inflater.inflate(R.layout.fragment_tutorial, container, false)

        page1 = v.findViewById(R.id.cltutop1)
        page2 = v.findViewById(R.id.cltutop2)
        page3 = v.findViewById(R.id.cltutop3)
        page4 = v.findViewById(R.id.cltutop4)
        page5 = v.findViewById(R.id.cltutop5)
        page6 = v.findViewById(R.id.cltutop6)
        page7 = v.findViewById(R.id.cltutop7)
        page8 = v.findViewById(R.id.cltutop8)
        page9 = v.findViewById(R.id.cltutop9)
        page10 = v.findViewById(R.id.cltutop10)
        page11 = v.findViewById(R.id.cltutop11)
        page12 = v.findViewById(R.id.cltutop12)
        pageend = v.findViewById(R.id.cltutopend)

        nextButton = v.findViewById(R.id.nextButton)
        backButton = v.findViewById(R.id.backButton)
        background = v.findViewById(R.id.optionsMenuConst)

        backButton.isEnabled = false

        pagesArray = arrayListOf(
            page1,
            page2,
            page3,
            page4,
            page5,
            page6,
            page7,
            page8,
            page9,
            page10,
            page11,
            page12,
            pageend
        )

        nextButton.setOnClickListener {
            pagePosition++
            if (pagePosition == pagesArray.size - 1) {
                nextButton.isEnabled = false
            }
            if (pagePosition != 0) {
                backButton.isEnabled = true
            }
            pagesArray[pagePosition - 1].visibility = View.GONE
            pagesArray[pagePosition].visibility = View.VISIBLE

        }

        backButton.setOnClickListener {
            pagePosition--
            if (pagePosition != pagesArray.size - 1) {
                nextButton.isEnabled = true
            }
            if (pagePosition == 0) {
                backButton.isEnabled = false
            }
            pagesArray[pagePosition + 1].visibility = View.GONE
            pagesArray[pagePosition].visibility = View.VISIBLE

        }
        return v
    }
}
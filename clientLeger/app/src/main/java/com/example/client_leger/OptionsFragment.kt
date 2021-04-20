package com.example.client_leger

import android.content.Intent
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import androidx.constraintlayout.widget.ConstraintLayout
import androidx.fragment.app.Fragment
import io.socket.emitter.Emitter


class OptionsFragment : Fragment() {

    var mSocket = SocketInstance.getMSocket()
    lateinit var languageSpinner: Spinner
    lateinit var themeSpinner: Spinner
    private lateinit var changeButton: Button
    lateinit var themeButton: Button
    private var currentLanguage = "fr"
    private var currentTheme = "light"
    private lateinit var opMenu: ConstraintLayout

    override fun onCreateView(
        inflater: LayoutInflater, container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View? {
        val v = inflater.inflate(R.layout.fragment_options, container, false)

        languageSpinner = v.findViewById(R.id.spinner)
        themeSpinner = v.findViewById(R.id.themeSpinner)
        changeButton = v.findViewById(R.id.changeLang)
        themeButton = v.findViewById(R.id.changeTheme)
        opMenu = v.findViewById(R.id.optionsMenuConst)

        if (LocaleUtils.selectedLanguageId == "fr") {
            ArrayAdapter.createFromResource(
                activity!!.baseContext,
                R.array.french_array,
                android.R.layout.simple_spinner_item
            ).also { adapter ->
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                languageSpinner.adapter = adapter
            }
        } else {
            ArrayAdapter.createFromResource(
                activity!!.baseContext,
                R.array.english_array,
                android.R.layout.simple_spinner_item
            ).also { adapter ->
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                languageSpinner.adapter = adapter
            }
        }

        if (LocaleUtils.selectedThemeId == "light") {
            ArrayAdapter.createFromResource(
                activity!!.baseContext,
                R.array.light_array,
                android.R.layout.simple_spinner_item
            ).also { adapter ->
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                themeSpinner.adapter = adapter
            }
        } else {
            ArrayAdapter.createFromResource(
                activity!!.baseContext,
                R.array.dark_array,
                android.R.layout.simple_spinner_item
            ).also { adapter ->
                adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
                themeSpinner.adapter = adapter
            }
        }

        languageSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                currentLanguage = languageSpinner.selectedItem.toString()
                when (currentLanguage) {
                    "Français" -> currentLanguage = "fr"
                    "English" -> currentLanguage = "en"
                }

            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        themeSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {

            override fun onItemSelected(
                parent: AdapterView<*>?,
                view: View?,
                position: Int,
                id: Long
            ) {
                currentTheme = themeSpinner.selectedItem.toString()
                when (currentTheme) {
                    "Clair" -> currentTheme = "light"
                    "Light" -> currentTheme = "light"
                    "Sombre" -> currentTheme = "dark"
                    "Dark" -> currentTheme = "dark"
                }

            }

            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        changeButton.setOnClickListener {
            if (LocaleUtils.selectedLanguageId != currentLanguage) {
                LocaleUtils.selectedLanguageId = currentLanguage
                var act = activity as MainMenu
                val i = Intent(act, MainMenu::class.java)
                i.putExtra("changeoptions", true)
                i.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                startActivity(i)
            }
        }

        themeButton.setOnClickListener {
            if (LocaleUtils.selectedThemeId != currentTheme) {
                LocaleUtils.selectedThemeId = currentTheme
                var act = activity as MainMenu
                val i = Intent(act, MainMenu::class.java)
                i.putExtra("changeoptions", true)
                i.addFlags(Intent.FLAG_ACTIVITY_NO_ANIMATION)
                startActivity(i)
            }
        }
        return v
    }
}
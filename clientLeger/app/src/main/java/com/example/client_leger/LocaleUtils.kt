package com.example.client_leger

import android.content.Context
import android.content.SharedPreferences
import android.content.res.Configuration
import android.content.res.Resources
import android.os.Build
import android.preference.PreferenceManager
import androidx.annotation.RequiresApi
import androidx.annotation.StringDef
import java.util.*


object LocaleUtils {
    const val ENGLISH = "en"
    const val FRENCH = "fr"

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    fun initialize(context: Context, @LocaleDef defaultLanguage: String?) {
        setLocale(context, defaultLanguage)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    fun setLocale(context: Context, @LocaleDef language: String?): Boolean {
        return updateResources(context, language)
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    private fun updateResources(context: Context, language: String?): Boolean {
        val locale = Locale(language)
        Locale.setDefault(locale)
        val resources: Resources = context.resources
        val configuration: Configuration = resources.configuration
        context.createConfigurationContext(configuration)
        configuration.locale = locale
        resources.updateConfiguration(configuration, resources.displayMetrics)
        return true
    }

    private fun getDefaultSharedPreference(context: Context): SharedPreferences? {
        return if (PreferenceManager.getDefaultSharedPreferences(
                Application.instance?.applicationContext
            ) != null
        ) PreferenceManager.getDefaultSharedPreferences(
            Application.instance?.applicationContext
        ) else null
    }

    var selectedLanguageId: String?
        get() = getDefaultSharedPreference(
            Application.instance!!.applicationContext
        )
            ?.getString("app_language_id", "en")
        set(id) {
            val prefs = getDefaultSharedPreference(
                Application.instance!!.applicationContext
            )
            val editor = prefs!!.edit()
            editor.putString("app_language_id", id)
            editor.apply()
        }

    var selectedThemeId: String?
        get() = getDefaultSharedPreference(
            Application.instance!!.applicationContext
        )
            ?.getString("app_theme_id", "en")
        set(id) {
            val prefs = getDefaultSharedPreference(
                Application.instance!!.applicationContext
            )
            val editor = prefs!!.edit()
            editor.putString("app_theme_id", id)
            editor.apply()
        }

    @Retention(AnnotationRetention.SOURCE)
    @StringDef(ENGLISH, FRENCH)
    annotation class LocaleDef {
        companion object {
            var SUPPORTED_LOCALES =
                arrayOf(ENGLISH, FRENCH)
        }
    }
}
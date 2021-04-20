package com.example.client_leger

import android.content.Context
import android.os.Build
import androidx.annotation.RequiresApi


class Application : android.app.Application() {
    override fun onCreate() {
        super.onCreate()
        instance = this
    }

    @RequiresApi(Build.VERSION_CODES.JELLY_BEAN_MR1)
    fun initAppLanguage(context: Context?) {
        LocaleUtils.initialize(context!!, LocaleUtils.selectedLanguageId)
    }

    companion object {
        @get:Synchronized
        var instance: Application? = null
            private set
    }
}
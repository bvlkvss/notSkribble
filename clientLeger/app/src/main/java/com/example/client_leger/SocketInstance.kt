package com.example.client_leger

import android.media.MediaPlayer
import io.socket.client.IO
import io.socket.client.Socket
import java.net.URISyntaxException


private const val URL = "http://104.215.88.171:5000"
//private const val URL = "http://10.0.2.2:5000"

object SocketInstance {


    private var mSocket: Socket? = null
    val opts = IO.Options()


    var username: String = "username"
    var roomName: String = ""
    var useravatar: String = ""
    var timeStamp: String = ""
    var isNotify: HashMap<String, Boolean> = HashMap()
    var ring: MediaPlayer? = null

    init {
        opts.reconnection = true
        if (mSocket == null) {
            try {
                mSocket = IO.socket(URL, opts)
            } catch (e: URISyntaxException) {
                throw RuntimeException(e)
            }
        }

        mSocket?.connect()
    }

    fun getMSocket(): Socket? {
        return mSocket
    }
}
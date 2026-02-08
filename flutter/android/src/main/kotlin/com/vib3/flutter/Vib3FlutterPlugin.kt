package com.vib3.flutter

import android.opengl.*
import android.graphics.SurfaceTexture
import android.os.Handler
import android.os.HandlerThread
import android.view.Choreographer
import io.flutter.embedding.engine.plugins.FlutterPlugin
import io.flutter.plugin.common.MethodCall
import io.flutter.plugin.common.MethodChannel
import io.flutter.view.TextureRegistry
import java.nio.ByteBuffer
import java.nio.ByteOrder
import java.nio.FloatBuffer
import java.nio.ShortBuffer

class Vib3FlutterPlugin : FlutterPlugin, MethodChannel.MethodCallHandler {
    private lateinit var channel: MethodChannel
    private var textureEntry: TextureRegistry.SurfaceTextureEntry? = null
    private var renderer: Vib3GLRenderer? = null
    private var flutterPluginBinding: FlutterPlugin.FlutterPluginBinding? = null

    companion object {
        init {
            try {
                System.loadLibrary("vib3_flutter")
            } catch (e: UnsatisfiedLinkError) {
                // Native library not available; FFI calls will fail gracefully
            }
        }
    }

    override fun onAttachedToEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        flutterPluginBinding = binding
        channel = MethodChannel(binding.binaryMessenger, "com.vib3.engine")
        channel.setMethodCallHandler(this)
    }

    override fun onDetachedFromEngine(binding: FlutterPlugin.FlutterPluginBinding) {
        channel.setMethodCallHandler(null)
        renderer?.dispose()
        renderer = null
        textureEntry?.release()
        textureEntry = null
        flutterPluginBinding = null
    }

    override fun onMethodCall(call: MethodCall, result: MethodChannel.Result) {
        when (call.method) {
            "initialize" -> handleInitialize(call, result)
            "dispose" -> handleDispose(result)
            "setSystem" -> handleSetSystem(call, result)
            "setGeometry" -> handleSetGeometry(call, result)
            "rotate" -> handleRotate(call, result)
            "setRotation" -> handleSetRotation(call, result)
            "resetRotation" -> handleResetRotation(result)
            "setVisualParams" -> handleSetVisualParams(call, result)
            "startRendering" -> handleStartRendering(result)
            "stopRendering" -> handleStopRendering(result)
            "captureFrame" -> handleCaptureFrame(result)
            else -> result.notImplemented()
        }
    }

    private fun handleInitialize(call: MethodCall, result: MethodChannel.Result) {
        val binding = flutterPluginBinding ?: run {
            result.error("NOT_ATTACHED", "Plugin not attached to engine", null)
            return
        }

        val system = call.argument<String>("system") ?: "quantum"
        val geometry = call.argument<Int>("geometry") ?: 0
        val gridDensity = call.argument<Int>("gridDensity") ?: 32

        // Create texture entry
        textureEntry = binding.textureRegistry.createSurfaceTexture()
        val surfaceTexture = textureEntry!!.surfaceTexture()
        surfaceTexture.setDefaultBufferSize(1024, 1024)

        // Create renderer
        renderer = Vib3GLRenderer(surfaceTexture).apply {
            setSystem(system)
            setGeometry(geometry)
            setGridDensity(gridDensity)
        }

        // Apply initial rotation if provided
        @Suppress("UNCHECKED_CAST")
        val rotation = call.argument<Map<String, Double>>("rotation")
        if (rotation != null) {
            renderer?.setRotation(
                (rotation["xy"] ?: 0.0).toFloat(),
                (rotation["xz"] ?: 0.0).toFloat(),
                (rotation["yz"] ?: 0.0).toFloat(),
                (rotation["xw"] ?: 0.0).toFloat(),
                (rotation["yw"] ?: 0.0).toFloat(),
                (rotation["zw"] ?: 0.0).toFloat()
            )
        }

        result.success(mapOf("textureId" to textureEntry!!.id()))
    }

    private fun handleDispose(result: MethodChannel.Result) {
        renderer?.dispose()
        renderer = null
        textureEntry?.release()
        textureEntry = null
        result.success(null)
    }

    private fun handleSetSystem(call: MethodCall, result: MethodChannel.Result) {
        val system = call.argument<String>("system")
        if (system != null) {
            renderer?.setSystem(system)
        }
        result.success(null)
    }

    private fun handleSetGeometry(call: MethodCall, result: MethodChannel.Result) {
        val index = call.argument<Int>("index")
        if (index != null) {
            renderer?.setGeometry(index)
        }
        result.success(null)
    }

    private fun handleRotate(call: MethodCall, result: MethodChannel.Result) {
        val plane = call.argument<String>("plane") ?: return result.success(null)
        val angle = call.argument<Double>("angle")?.toFloat() ?: return result.success(null)
        renderer?.rotate(plane, angle)
        result.success(null)
    }

    private fun handleSetRotation(call: MethodCall, result: MethodChannel.Result) {
        val xy = (call.argument<Double>("xy") ?: 0.0).toFloat()
        val xz = (call.argument<Double>("xz") ?: 0.0).toFloat()
        val yz = (call.argument<Double>("yz") ?: 0.0).toFloat()
        val xw = (call.argument<Double>("xw") ?: 0.0).toFloat()
        val yw = (call.argument<Double>("yw") ?: 0.0).toFloat()
        val zw = (call.argument<Double>("zw") ?: 0.0).toFloat()
        renderer?.setRotation(xy, xz, yz, xw, yw, zw)
        result.success(null)
    }

    private fun handleResetRotation(result: MethodChannel.Result) {
        renderer?.resetRotation()
        result.success(null)
    }

    private fun handleSetVisualParams(call: MethodCall, result: MethodChannel.Result) {
        val args = call.arguments as? Map<*, *> ?: return result.success(null)
        for ((key, value) in args) {
            if (key is String && value is Double) {
                renderer?.setVisualParam(key, value.toFloat())
            }
        }
        result.success(null)
    }

    private fun handleStartRendering(result: MethodChannel.Result) {
        renderer?.startRendering()
        result.success(null)
    }

    private fun handleStopRendering(result: MethodChannel.Result) {
        renderer?.stopRendering()
        result.success(null)
    }

    private fun handleCaptureFrame(result: MethodChannel.Result) {
        result.success(null)
    }
}

/**
 * OpenGL ES renderer for VIB3 4D visualization.
 * Runs on a dedicated GL thread via HandlerThread.
 */
class Vib3GLRenderer(private val surfaceTexture: SurfaceTexture) {
    private var glThread: HandlerThread? = null
    private var glHandler: Handler? = null

    private var eglDisplay: EGLDisplay? = null
    private var eglContext: EGLContext? = null
    private var eglSurface: EGLSurface? = null

    private var program = 0
    private var vertexBuffer: FloatBuffer? = null
    private var indexBuffer: ShortBuffer? = null
    private var indexCount = 0
    private val textureSize = 1024

    // State
    private var currentSystem = "quantum"
    private var currentGeometry = 0
    private var gridDensity = 32
    private val rotation = FloatArray(6) // xy, xz, yz, xw, yw, zw
    private val visualParams = mutableMapOf(
        "morphFactor" to 0.5f,
        "chaos" to 0.0f,
        "speed" to 1.0f,
        "hue" to 200f,
        "intensity" to 0.8f,
        "saturation" to 0.7f,
        "dimension" to 3.5f
    )

    private var isRendering = false
    private var startTime = System.nanoTime()

    // Synchronization lock for GL context access
    private val glLock = Object()

    init {
        initGL()
    }

    private fun initGL() {
        glThread = HandlerThread("Vib3GLThread").apply { start() }
        glHandler = Handler(glThread!!.looper)

        glHandler?.post {
            synchronized(glLock) {
                setupEGL()
                setupShaders()
                generateGeometry()
            }
        }
    }

    private fun setupEGL() {
        eglDisplay = EGL14.eglGetDisplay(EGL14.EGL_DEFAULT_DISPLAY)
        val version = IntArray(2)
        EGL14.eglInitialize(eglDisplay, version, 0, version, 1)

        val configAttribs = intArrayOf(
            EGL14.EGL_RED_SIZE, 8,
            EGL14.EGL_GREEN_SIZE, 8,
            EGL14.EGL_BLUE_SIZE, 8,
            EGL14.EGL_ALPHA_SIZE, 8,
            EGL14.EGL_DEPTH_SIZE, 16,
            EGL14.EGL_RENDERABLE_TYPE, EGL14.EGL_OPENGL_ES2_BIT,
            EGL14.EGL_NONE
        )

        val configs = arrayOfNulls<EGLConfig>(1)
        val numConfigs = IntArray(1)
        EGL14.eglChooseConfig(eglDisplay, configAttribs, 0, configs, 0, 1, numConfigs, 0)

        val contextAttribs = intArrayOf(
            EGL14.EGL_CONTEXT_CLIENT_VERSION, 2,
            EGL14.EGL_NONE
        )

        eglContext = EGL14.eglCreateContext(eglDisplay, configs[0], EGL14.EGL_NO_CONTEXT, contextAttribs, 0)

        val surfaceAttribs = intArrayOf(
            EGL14.EGL_WIDTH, textureSize,
            EGL14.EGL_HEIGHT, textureSize,
            EGL14.EGL_NONE
        )

        eglSurface = EGL14.eglCreatePbufferSurface(eglDisplay, configs[0], surfaceAttribs, 0)
        EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)

        surfaceTexture.setDefaultBufferSize(textureSize, textureSize)
    }

    private fun setupShaders() {
        val vertexShaderSrc = """
            attribute vec4 aPosition;
            attribute vec4 aColor;
            varying vec4 vColor;
            varying float vDepth;
            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform float uRotation[6];
            uniform float uProjDist;
            uniform float uHue;
            uniform float uIntensity;
            uniform float uSaturation;

            vec4 rotateXY(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(c*p.x - s*p.y, s*p.x + c*p.y, p.z, p.w);
            }
            vec4 rotateXZ(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(c*p.x - s*p.z, p.y, s*p.x + c*p.z, p.w);
            }
            vec4 rotateYZ(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(p.x, c*p.y - s*p.z, s*p.y + c*p.z, p.w);
            }
            vec4 rotateXW(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(c*p.x - s*p.w, p.y, p.z, s*p.x + c*p.w);
            }
            vec4 rotateYW(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(p.x, c*p.y - s*p.w, p.z, s*p.y + c*p.w);
            }
            vec4 rotateZW(vec4 p, float a) {
                float c = cos(a), s = sin(a);
                return vec4(p.x, p.y, c*p.z - s*p.w, s*p.z + c*p.w);
            }

            vec3 hsv2rgb(vec3 c) {
                vec4 K = vec4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
                vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
                return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
            }

            void main() {
                vec4 pos = aPosition;
                pos = rotateXY(pos, uRotation[0]);
                pos = rotateXZ(pos, uRotation[1]);
                pos = rotateYZ(pos, uRotation[2]);
                pos = rotateXW(pos, uRotation[3]);
                pos = rotateYW(pos, uRotation[4]);
                pos = rotateZW(pos, uRotation[5]);

                float d = max(uProjDist, 1.5);
                float scale = d / (d - pos.w);
                vec3 proj = pos.xyz * scale;

                gl_Position = uProjection * uView * vec4(proj, 1.0);

                float wNorm = (pos.w + 1.0) * 0.5;
                float hue = uHue / 360.0 + wNorm * 0.3;
                vec3 rgb = hsv2rgb(vec3(hue, uSaturation, uIntensity));
                vColor = vec4(rgb, 1.0);
                vDepth = wNorm;
            }
        """.trimIndent()

        val fragmentShaderSrc = """
            precision mediump float;
            varying vec4 vColor;
            varying float vDepth;
            void main() {
                float fog = 1.0 - vDepth * 0.3;
                gl_FragColor = vec4(vColor.rgb * fog, vColor.a);
            }
        """.trimIndent()

        val vertexShader = loadShader(GLES20.GL_VERTEX_SHADER, vertexShaderSrc)
        val fragmentShader = loadShader(GLES20.GL_FRAGMENT_SHADER, fragmentShaderSrc)

        program = GLES20.glCreateProgram()
        GLES20.glAttachShader(program, vertexShader)
        GLES20.glAttachShader(program, fragmentShader)
        GLES20.glLinkProgram(program)

        GLES20.glDeleteShader(vertexShader)
        GLES20.glDeleteShader(fragmentShader)
    }

    private fun loadShader(type: Int, source: String): Int {
        val shader = GLES20.glCreateShader(type)
        GLES20.glShaderSource(shader, source)
        GLES20.glCompileShader(shader)
        return shader
    }

    private fun generateGeometry() {
        val vertices = FloatArray(16 * 8)
        for (i in 0 until 16) {
            val x = if (i and 1 == 0) -1f else 1f
            val y = if (i and 2 == 0) -1f else 1f
            val z = if (i and 4 == 0) -1f else 1f
            val w = if (i and 8 == 0) -1f else 1f

            vertices[i * 8 + 0] = x
            vertices[i * 8 + 1] = y
            vertices[i * 8 + 2] = z
            vertices[i * 8 + 3] = w
            vertices[i * 8 + 4] = 1f
            vertices[i * 8 + 5] = 1f
            vertices[i * 8 + 6] = 1f
            vertices[i * 8 + 7] = 1f
        }

        val indexList = mutableListOf<Short>()
        for (i in 0 until 16) {
            for (bit in 0 until 4) {
                val j = i xor (1 shl bit)
                if (j > i) {
                    indexList.add(i.toShort())
                    indexList.add(j.toShort())
                }
            }
        }
        indexCount = indexList.size

        val bb = ByteBuffer.allocateDirect(vertices.size * 4)
        bb.order(ByteOrder.nativeOrder())
        vertexBuffer = bb.asFloatBuffer().apply {
            put(vertices)
            position(0)
        }

        val ib = ByteBuffer.allocateDirect(indexList.size * 2)
        ib.order(ByteOrder.nativeOrder())
        indexBuffer = ib.asShortBuffer().apply {
            put(indexList.toShortArray())
            position(0)
        }
    }

    fun setSystem(system: String) {
        currentSystem = system
        glHandler?.post {
            synchronized(glLock) {
                generateGeometry()
            }
        }
    }

    fun setGeometry(index: Int) {
        currentGeometry = index
        glHandler?.post {
            synchronized(glLock) {
                generateGeometry()
            }
        }
    }

    fun setGridDensity(density: Int) {
        gridDensity = density
    }

    fun rotate(plane: String, angle: Float) {
        synchronized(glLock) {
            when (plane.lowercase()) {
                "xy" -> rotation[0] = angle
                "xz" -> rotation[1] = angle
                "yz" -> rotation[2] = angle
                "xw" -> rotation[3] = angle
                "yw" -> rotation[4] = angle
                "zw" -> rotation[5] = angle
            }
        }
    }

    fun setRotation(xy: Float, xz: Float, yz: Float, xw: Float, yw: Float, zw: Float) {
        synchronized(glLock) {
            rotation[0] = xy
            rotation[1] = xz
            rotation[2] = yz
            rotation[3] = xw
            rotation[4] = yw
            rotation[5] = zw
        }
    }

    fun resetRotation() {
        synchronized(glLock) {
            rotation.fill(0f)
        }
    }

    fun setVisualParam(name: String, value: Float) {
        synchronized(glLock) {
            visualParams[name] = value
        }
    }

    private val frameCallback = object : Choreographer.FrameCallback {
        override fun doFrame(frameTimeNanos: Long) {
            if (!isRendering) return
            glHandler?.post {
                synchronized(glLock) {
                    render()
                }
            }
            Choreographer.getInstance().postFrameCallback(this)
        }
    }

    fun startRendering() {
        if (isRendering) return
        isRendering = true
        startTime = System.nanoTime()
        Choreographer.getInstance().postFrameCallback(frameCallback)
    }

    fun stopRendering() {
        isRendering = false
        Choreographer.getInstance().removeFrameCallback(frameCallback)
    }

    private fun render() {
        if (eglDisplay == null || eglContext == null) return

        EGL14.eglMakeCurrent(eglDisplay, eglSurface, eglSurface, eglContext)

        GLES20.glViewport(0, 0, textureSize, textureSize)
        GLES20.glClearColor(0f, 0f, 0.1f, 1f)
        GLES20.glClear(GLES20.GL_COLOR_BUFFER_BIT or GLES20.GL_DEPTH_BUFFER_BIT)
        GLES20.glEnable(GLES20.GL_DEPTH_TEST)

        GLES20.glUseProgram(program)

        val rotLoc = GLES20.glGetUniformLocation(program, "uRotation")
        GLES20.glUniform1fv(rotLoc, 6, rotation, 0)

        val projDistLoc = GLES20.glGetUniformLocation(program, "uProjDist")
        GLES20.glUniform1f(projDistLoc, visualParams["dimension"] ?: 3.5f)

        val hueLoc = GLES20.glGetUniformLocation(program, "uHue")
        GLES20.glUniform1f(hueLoc, visualParams["hue"] ?: 200f)

        val intLoc = GLES20.glGetUniformLocation(program, "uIntensity")
        GLES20.glUniform1f(intLoc, visualParams["intensity"] ?: 0.8f)

        val satLoc = GLES20.glGetUniformLocation(program, "uSaturation")
        GLES20.glUniform1f(satLoc, visualParams["saturation"] ?: 0.7f)

        val projMatrix = FloatArray(16)
        android.opengl.Matrix.perspectiveM(projMatrix, 0, 45f, 1f, 0.1f, 100f)
        val projLoc = GLES20.glGetUniformLocation(program, "uProjection")
        GLES20.glUniformMatrix4fv(projLoc, 1, false, projMatrix, 0)

        val viewMatrix = FloatArray(16)
        android.opengl.Matrix.setIdentityM(viewMatrix, 0)
        android.opengl.Matrix.translateM(viewMatrix, 0, 0f, 0f, -5f)
        val viewLoc = GLES20.glGetUniformLocation(program, "uView")
        GLES20.glUniformMatrix4fv(viewLoc, 1, false, viewMatrix, 0)

        val posLoc = GLES20.glGetAttribLocation(program, "aPosition")
        val colLoc = GLES20.glGetAttribLocation(program, "aColor")

        vertexBuffer?.position(0)
        GLES20.glVertexAttribPointer(posLoc, 4, GLES20.GL_FLOAT, false, 32, vertexBuffer)
        GLES20.glEnableVertexAttribArray(posLoc)

        vertexBuffer?.position(4)
        GLES20.glVertexAttribPointer(colLoc, 4, GLES20.GL_FLOAT, false, 32, vertexBuffer)
        GLES20.glEnableVertexAttribArray(colLoc)

        GLES20.glDrawElements(GLES20.GL_LINES, indexCount, GLES20.GL_UNSIGNED_SHORT, indexBuffer)

        GLES20.glDisableVertexAttribArray(posLoc)
        GLES20.glDisableVertexAttribArray(colLoc)

        EGL14.eglSwapBuffers(eglDisplay, eglSurface)
    }

    fun dispose() {
        stopRendering()
        glHandler?.post {
            synchronized(glLock) {
                if (program != 0) {
                    GLES20.glDeleteProgram(program)
                    program = 0
                }
                if (eglDisplay != null) {
                    EGL14.eglMakeCurrent(eglDisplay, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_SURFACE, EGL14.EGL_NO_CONTEXT)
                    EGL14.eglDestroySurface(eglDisplay, eglSurface)
                    EGL14.eglDestroyContext(eglDisplay, eglContext)
                    EGL14.eglTerminate(eglDisplay)
                    eglDisplay = null
                    eglContext = null
                    eglSurface = null
                }
            }
            glThread?.quitSafely()
        }
    }
}

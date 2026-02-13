import Flutter
import UIKit
import Metal
import MetalKit
import CoreVideo

/// VIB3 Flutter Plugin for iOS
public class Vib3FlutterPlugin: NSObject, FlutterPlugin {
    private var registrar: FlutterPluginRegistrar?
    private var renderer: Vib3MetalRenderer?
    private var textureRegistry: FlutterTextureRegistry?
    private var textureId: Int64?

    public static func register(with registrar: FlutterPluginRegistrar) {
        let channel = FlutterMethodChannel(name: "com.vib3.engine", binaryMessenger: registrar.messenger())
        let instance = Vib3FlutterPlugin()
        instance.registrar = registrar
        instance.textureRegistry = registrar.textures()
        registrar.addMethodCallDelegate(instance, channel: channel)
    }

    public func handle(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        switch call.method {
        case "initialize":
            handleInitialize(call, result: result)
        case "dispose":
            handleDispose(result: result)
        case "setSystem":
            handleSetSystem(call, result: result)
        case "setGeometry":
            handleSetGeometry(call, result: result)
        case "rotate":
            handleRotate(call, result: result)
        case "setRotation":
            handleSetRotation(call, result: result)
        case "resetRotation":
            handleResetRotation(result: result)
        case "setVisualParams":
            handleSetVisualParams(call, result: result)
        case "startRendering":
            handleStartRendering(result: result)
        case "stopRendering":
            handleStopRendering(result: result)
        case "captureFrame":
            handleCaptureFrame(result: result)
        default:
            result(FlutterMethodNotImplemented)
        }
    }

    private func handleInitialize(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any] else {
            result(FlutterError(code: "INVALID_ARGS", message: "Invalid arguments", details: nil))
            return
        }

        let system = args["system"] as? String ?? "quantum"
        let geometry = args["geometry"] as? Int ?? 0
        let gridDensity = args["gridDensity"] as? Int ?? 32

        // Create Metal renderer
        renderer = Vib3MetalRenderer()

        guard let renderer = renderer else {
            result(FlutterError(code: "INIT_FAILED", message: "Failed to create renderer", details: nil))
            return
        }

        // Register texture with Flutter
        textureId = textureRegistry?.register(renderer)

        // Configure renderer
        renderer.setSystem(system)
        renderer.setGeometry(geometry)
        renderer.setGridDensity(gridDensity)

        if let rotation = args["rotation"] as? [String: Double] {
            renderer.setRotation(
                xy: Float(rotation["xy"] ?? 0),
                xz: Float(rotation["xz"] ?? 0),
                yz: Float(rotation["yz"] ?? 0),
                xw: Float(rotation["xw"] ?? 0),
                yw: Float(rotation["yw"] ?? 0),
                zw: Float(rotation["zw"] ?? 0)
            )
        }

        result(["textureId": textureId ?? -1])
    }

    private func handleDispose(result: @escaping FlutterResult) {
        if let textureId = textureId {
            textureRegistry?.unregisterTexture(textureId)
        }
        renderer?.dispose()
        renderer = nil
        textureId = nil
        result(nil)
    }

    private func handleSetSystem(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let system = args["system"] as? String else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing system", details: nil))
            return
        }
        renderer?.setSystem(system)
        result(nil)
    }

    private func handleSetGeometry(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let index = args["index"] as? Int else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing geometry index", details: nil))
            return
        }
        renderer?.setGeometry(index)
        result(nil)
    }

    private func handleRotate(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Any],
              let plane = args["plane"] as? String,
              let angle = args["angle"] as? Double else {
            result(FlutterError(code: "INVALID_ARGS", message: "Missing rotation params", details: nil))
            return
        }
        renderer?.rotate(plane: plane, angle: Float(angle))
        result(nil)
    }

    private func handleSetRotation(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Double] else {
            result(FlutterError(code: "INVALID_ARGS", message: "Invalid rotation", details: nil))
            return
        }
        renderer?.setRotation(
            xy: Float(args["xy"] ?? 0),
            xz: Float(args["xz"] ?? 0),
            yz: Float(args["yz"] ?? 0),
            xw: Float(args["xw"] ?? 0),
            yw: Float(args["yw"] ?? 0),
            zw: Float(args["zw"] ?? 0)
        )
        result(nil)
    }

    private func handleResetRotation(result: @escaping FlutterResult) {
        renderer?.resetRotation()
        result(nil)
    }

    private func handleSetVisualParams(_ call: FlutterMethodCall, result: @escaping FlutterResult) {
        guard let args = call.arguments as? [String: Double] else {
            result(FlutterError(code: "INVALID_ARGS", message: "Invalid params", details: nil))
            return
        }
        for (key, value) in args {
            renderer?.setVisualParam(key, value: Float(value))
        }
        result(nil)
    }

    private func handleStartRendering(result: @escaping FlutterResult) {
        renderer?.startRendering { [weak self] in
            guard let self = self, let textureId = self.textureId else { return }
            self.textureRegistry?.textureFrameAvailable(textureId)
        }
        result(nil)
    }

    private func handleStopRendering(result: @escaping FlutterResult) {
        renderer?.stopRendering()
        result(nil)
    }

    private func handleCaptureFrame(result: @escaping FlutterResult) {
        if let imageData = renderer?.captureFrame() {
            result(FlutterStandardTypedData(bytes: imageData))
        } else {
            result(nil)
        }
    }
}

/// 6-component rotation struct (replaces invalid simd_float6)
struct Rotation6D {
    var xy: Float = 0
    var xz: Float = 0
    var yz: Float = 0
    var xw: Float = 0
    var yw: Float = 0
    var zw: Float = 0

    subscript(index: Int) -> Float {
        get {
            switch index {
            case 0: return xy
            case 1: return xz
            case 2: return yz
            case 3: return xw
            case 4: return yw
            case 5: return zw
            default: return 0
            }
        }
        set {
            switch index {
            case 0: xy = newValue
            case 1: xz = newValue
            case 2: yz = newValue
            case 3: xw = newValue
            case 4: yw = newValue
            case 5: zw = newValue
            default: break
            }
        }
    }

    mutating func reset() {
        xy = 0; xz = 0; yz = 0; xw = 0; yw = 0; zw = 0
    }

    func toArray() -> [Float] {
        return [xy, xz, yz, xw, yw, zw]
    }
}

/// Metal Renderer for VIB3 4D Visualization
class Vib3MetalRenderer: NSObject, FlutterTexture {
    private var device: MTLDevice?
    private var commandQueue: MTLCommandQueue?
    private var pipelineState: MTLRenderPipelineState?
    private var texture: MTLTexture?
    private var depthTexture: MTLTexture?
    private var vertexBuffer: MTLBuffer?
    private var indexBuffer: MTLBuffer?
    private var uniformBuffer: MTLBuffer?

    private var displayLink: CADisplayLink?
    private var isRendering = false
    private var frameCallback: (() -> Void)?

    // CVPixelBuffer for Flutter texture bridge
    private var pixelBuffer: CVPixelBuffer?
    private var textureCache: CVMetalTextureCache?

    // State
    private var currentSystem = "quantum"
    private var currentGeometry = 0
    private var gridDensity = 32
    private var rotation = Rotation6D()
    private var visualParams: [String: Float] = [
        "morphFactor": 0.5,
        "chaos": 0.0,
        "speed": 1.0,
        "hue": 200,
        "intensity": 0.8,
        "saturation": 0.7
    ]

    private let textureWidth = 1024
    private let textureHeight = 1024
    private var startTime: CFAbsoluteTime = CFAbsoluteTimeGetCurrent()

    // Uniform buffer layout (must match shader)
    struct Uniforms {
        var projection: simd_float4x4
        var view: simd_float4x4
        var rotationAngles: SIMD4<Float>  // xy, xz, yz, xw
        var rotationAngles2: SIMD4<Float> // yw, zw, projDist, _pad
        var colorParams: SIMD4<Float>     // hue, intensity, saturation, morphFactor
    }

    override init() {
        super.init()
        setupMetal()
    }

    private func setupMetal() {
        device = MTLCreateSystemDefaultDevice()
        guard let device = device else {
            print("VIB3: Metal not available")
            return
        }

        commandQueue = device.makeCommandQueue()

        // Create CVMetalTextureCache for Flutter texture bridge
        var cache: CVMetalTextureCache?
        CVMetalTextureCacheCreate(nil, nil, device, nil, &cache)
        textureCache = cache

        // Create CVPixelBuffer
        let attrs: [String: Any] = [
            kCVPixelBufferMetalCompatibilityKey as String: true,
            kCVPixelBufferIOSurfacePropertiesKey as String: [:]
        ]
        CVPixelBufferCreate(nil, textureWidth, textureHeight,
                           kCVPixelFormatType_32BGRA, attrs as CFDictionary, &pixelBuffer)

        // Create Metal texture from CVPixelBuffer
        if let pixelBuffer = pixelBuffer, let textureCache = textureCache {
            var cvTexture: CVMetalTexture?
            CVMetalTextureCacheCreateTextureFromImage(
                nil, textureCache, pixelBuffer, nil,
                .bgra8Unorm, textureWidth, textureHeight, 0, &cvTexture)
            if let cvTexture = cvTexture {
                texture = CVMetalTextureGetTexture(cvTexture)
            }
        }

        // Create depth texture
        let depthDescriptor = MTLTextureDescriptor.texture2DDescriptor(
            pixelFormat: .depth32Float,
            width: textureWidth,
            height: textureHeight,
            mipmapped: false
        )
        depthDescriptor.usage = .renderTarget
        depthDescriptor.storageMode = .private
        depthTexture = device.makeTexture(descriptor: depthDescriptor)

        // Create uniform buffer
        uniformBuffer = device.makeBuffer(length: MemoryLayout<Uniforms>.stride, options: [])

        // Setup render pipeline
        setupPipeline()

        // Generate initial geometry
        generateGeometry()
    }

    private func setupPipeline() {
        guard let device = device else { return }

        let shaderSource = """
        #include <metal_stdlib>
        using namespace metal;

        // Uniforms struct
        struct Uniforms {
            float4x4 projection;
            float4x4 view;
            float4 rotationAngles;   // xy, xz, yz, xw
            float4 rotationAngles2;  // yw, zw, projDist, _pad
            float4 colorParams;      // hue, intensity, saturation, morphFactor
        };

        // 4D rotation matrices
        float4x4 rotationXY(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(c, -s, 0, 0),
                float4(s,  c, 0, 0),
                float4(0,  0, 1, 0),
                float4(0,  0, 0, 1)
            );
        }

        float4x4 rotationXZ(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(c, 0, -s, 0),
                float4(0, 1,  0, 0),
                float4(s, 0,  c, 0),
                float4(0, 0,  0, 1)
            );
        }

        float4x4 rotationYZ(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(1, 0,  0, 0),
                float4(0, c, -s, 0),
                float4(0, s,  c, 0),
                float4(0, 0,  0, 1)
            );
        }

        float4x4 rotationXW(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(c, 0, 0, -s),
                float4(0, 1, 0,  0),
                float4(0, 0, 1,  0),
                float4(s, 0, 0,  c)
            );
        }

        float4x4 rotationYW(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(1, 0, 0,  0),
                float4(0, c, 0, -s),
                float4(0, 0, 1,  0),
                float4(0, s, 0,  c)
            );
        }

        float4x4 rotationZW(float angle) {
            float c = cos(angle), s = sin(angle);
            return float4x4(
                float4(1, 0, 0,  0),
                float4(0, 1, 0,  0),
                float4(0, 0, c, -s),
                float4(0, 0, s,  c)
            );
        }

        struct VertexIn {
            float4 position [[attribute(0)]];
            float4 color [[attribute(1)]];
        };

        struct VertexOut {
            float4 position [[position]];
            float4 color;
            float depth;
        };

        // 4D to 3D projection
        float3 project4Dto3D(float4 p, float d) {
            float scale = d / (d - p.w);
            return float3(p.x * scale, p.y * scale, p.z * scale);
        }

        // HSV to RGB
        float3 hsv2rgb(float3 c) {
            float4 K = float4(1.0, 2.0/3.0, 1.0/3.0, 3.0);
            float3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
            return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
        }

        vertex VertexOut vertexShader(
            VertexIn in [[stage_in]],
            constant Uniforms& uniforms [[buffer(1)]]
        ) {
            // Apply 6D rotation using individual angles from uniform vectors
            float4 rotated = in.position;
            rotated = rotationXY(uniforms.rotationAngles.x) * rotated;
            rotated = rotationXZ(uniforms.rotationAngles.y) * rotated;
            rotated = rotationYZ(uniforms.rotationAngles.z) * rotated;
            rotated = rotationXW(uniforms.rotationAngles.w) * rotated;
            rotated = rotationYW(uniforms.rotationAngles2.x) * rotated;
            rotated = rotationZW(uniforms.rotationAngles2.y) * rotated;

            float projDist = uniforms.rotationAngles2.z;
            if (projDist < 1.5) projDist = 2.0;

            // Project 4D to 3D
            float3 projected = project4Dto3D(rotated, projDist);

            // Apply view/projection
            float4 viewPos = uniforms.view * float4(projected, 1.0);
            float4 clipPos = uniforms.projection * viewPos;

            // W-based coloring
            float wNorm = (rotated.w + 1.0) * 0.5;
            float hue = uniforms.colorParams.x / 360.0 + wNorm * 0.3;
            float3 rgb = hsv2rgb(float3(hue, uniforms.colorParams.z, uniforms.colorParams.y));

            VertexOut out;
            out.position = clipPos;
            out.color = float4(rgb, 1.0);
            out.depth = wNorm;
            return out;
        }

        fragment float4 fragmentShader(VertexOut in [[stage_in]]) {
            // Apply W-fog for depth cue
            float fog = 1.0 - in.depth * 0.3;
            return float4(in.color.rgb * fog, in.color.a);
        }
        """

        do {
            let library = try device.makeLibrary(source: shaderSource, options: nil)
            let vertexFunction = library.makeFunction(name: "vertexShader")
            let fragmentFunction = library.makeFunction(name: "fragmentShader")

            let pipelineDescriptor = MTLRenderPipelineDescriptor()
            pipelineDescriptor.vertexFunction = vertexFunction
            pipelineDescriptor.fragmentFunction = fragmentFunction
            pipelineDescriptor.colorAttachments[0].pixelFormat = .bgra8Unorm
            pipelineDescriptor.depthAttachmentPixelFormat = .depth32Float

            // Vertex descriptor
            let vertexDescriptor = MTLVertexDescriptor()
            vertexDescriptor.attributes[0].format = .float4
            vertexDescriptor.attributes[0].offset = 0
            vertexDescriptor.attributes[0].bufferIndex = 0
            vertexDescriptor.attributes[1].format = .float4
            vertexDescriptor.attributes[1].offset = 16
            vertexDescriptor.attributes[1].bufferIndex = 0
            vertexDescriptor.layouts[0].stride = 32

            pipelineDescriptor.vertexDescriptor = vertexDescriptor

            pipelineState = try device.makeRenderPipelineState(descriptor: pipelineDescriptor)
        } catch {
            print("VIB3: Failed to create pipeline: \(error)")
        }
    }

    private func generateGeometry() {
        // Generate tesseract (4D hypercube) as default geometry
        var vertices: [Float] = []
        for i in 0..<16 {
            let x: Float = (i & 1) == 0 ? -1 : 1
            let y: Float = (i & 2) == 0 ? -1 : 1
            let z: Float = (i & 4) == 0 ? -1 : 1
            let w: Float = (i & 8) == 0 ? -1 : 1

            // Position (x, y, z, w)
            vertices.append(contentsOf: [x, y, z, w])
            // Color (computed in shader)
            vertices.append(contentsOf: [1, 1, 1, 1])
        }

        // 32 edges of a tesseract
        var indices: [UInt16] = []
        for i in 0..<16 {
            for bit in 0..<4 {
                let j = i ^ (1 << bit)
                if j > i {
                    indices.append(UInt16(i))
                    indices.append(UInt16(j))
                }
            }
        }

        vertexBuffer = device?.makeBuffer(
            bytes: vertices,
            length: vertices.count * MemoryLayout<Float>.size,
            options: []
        )

        indexBuffer = device?.makeBuffer(
            bytes: indices,
            length: indices.count * MemoryLayout<UInt16>.size,
            options: []
        )
    }

    func setSystem(_ system: String) {
        currentSystem = system
        generateGeometry()
    }

    func setGeometry(_ index: Int) {
        currentGeometry = index
        generateGeometry()
    }

    func setGridDensity(_ density: Int) {
        gridDensity = density
        generateGeometry()
    }

    func rotate(plane: String, angle: Float) {
        switch plane.lowercased() {
        case "xy": rotation.xy = angle
        case "xz": rotation.xz = angle
        case "yz": rotation.yz = angle
        case "xw": rotation.xw = angle
        case "yw": rotation.yw = angle
        case "zw": rotation.zw = angle
        default: break
        }
    }

    func setRotation(xy: Float, xz: Float, yz: Float, xw: Float, yw: Float, zw: Float) {
        rotation = Rotation6D(xy: xy, xz: xz, yz: yz, xw: xw, yw: yw, zw: zw)
    }

    func resetRotation() {
        rotation.reset()
    }

    func setVisualParam(_ name: String, value: Float) {
        visualParams[name] = value
    }

    func startRendering(onFrame: @escaping () -> Void) {
        guard !isRendering else { return }
        isRendering = true
        frameCallback = onFrame
        startTime = CFAbsoluteTimeGetCurrent()
        displayLink = CADisplayLink(target: self, selector: #selector(renderFrame))
        displayLink?.add(to: .main, forMode: .common)
    }

    func stopRendering() {
        isRendering = false
        displayLink?.invalidate()
        displayLink = nil
        frameCallback = nil
    }

    @objc private func renderFrame() {
        render()
        frameCallback?()
    }

    private func render() {
        guard let commandBuffer = commandQueue?.makeCommandBuffer(),
              let texture = texture,
              let depthTexture = depthTexture,
              let pipelineState = pipelineState else { return }

        // Update uniforms
        updateUniforms()

        // Render pass descriptor
        let renderPassDescriptor = MTLRenderPassDescriptor()
        renderPassDescriptor.colorAttachments[0].texture = texture
        renderPassDescriptor.colorAttachments[0].loadAction = .clear
        renderPassDescriptor.colorAttachments[0].storeAction = .store
        renderPassDescriptor.colorAttachments[0].clearColor = MTLClearColor(red: 0, green: 0, blue: 0.1, alpha: 1)
        renderPassDescriptor.depthAttachment.texture = depthTexture
        renderPassDescriptor.depthAttachment.loadAction = .clear
        renderPassDescriptor.depthAttachment.storeAction = .dontCare
        renderPassDescriptor.depthAttachment.clearDepth = 1.0

        guard let encoder = commandBuffer.makeRenderCommandEncoder(descriptor: renderPassDescriptor) else { return }

        encoder.setRenderPipelineState(pipelineState)
        encoder.setVertexBuffer(vertexBuffer, offset: 0, index: 0)
        encoder.setVertexBuffer(uniformBuffer, offset: 0, index: 1)

        // Draw
        if let indexBuffer = indexBuffer {
            encoder.drawIndexedPrimitives(
                type: .line,
                indexCount: 64,
                indexType: .uint16,
                indexBuffer: indexBuffer,
                indexBufferOffset: 0
            )
        }

        encoder.endEncoding()
        commandBuffer.commit()
    }

    private func updateUniforms() {
        guard let uniformBuffer = uniformBuffer else { return }

        // Build projection matrix (perspective)
        let aspect: Float = Float(textureWidth) / Float(textureHeight)
        let fov: Float = Float.pi / 4.0
        let near: Float = 0.1
        let far: Float = 100.0
        let tanHalf = tan(fov / 2.0)

        var projection = simd_float4x4(1)
        projection[0][0] = 1.0 / (aspect * tanHalf)
        projection[1][1] = 1.0 / tanHalf
        projection[2][2] = -(far + near) / (far - near)
        projection[2][3] = -1.0
        projection[3][2] = -(2.0 * far * near) / (far - near)
        projection[3][3] = 0.0

        // Build view matrix (lookAt)
        var view = simd_float4x4(1)
        view[3][2] = -5.0

        let projDist = visualParams["dimension"] ?? 2.0

        var uniforms = Uniforms(
            projection: projection,
            view: view,
            rotationAngles: SIMD4<Float>(rotation.xy, rotation.xz, rotation.yz, rotation.xw),
            rotationAngles2: SIMD4<Float>(rotation.yw, rotation.zw, projDist, 0),
            colorParams: SIMD4<Float>(
                visualParams["hue"] ?? 200,
                visualParams["intensity"] ?? 0.8,
                visualParams["saturation"] ?? 0.7,
                visualParams["morphFactor"] ?? 0.5
            )
        )

        memcpy(uniformBuffer.contents(), &uniforms, MemoryLayout<Uniforms>.stride)
    }

    func captureFrame() -> Data? {
        guard let texture = texture else { return nil }

        let bytesPerRow = textureWidth * 4
        let imageSize = bytesPerRow * textureHeight
        var imageData = Data(count: imageSize)

        imageData.withUnsafeMutableBytes { ptr in
            texture.getBytes(
                ptr.baseAddress!,
                bytesPerRow: bytesPerRow,
                from: MTLRegion(
                    origin: MTLOrigin(x: 0, y: 0, z: 0),
                    size: MTLSize(width: textureWidth, height: textureHeight, depth: 1)
                ),
                mipmapLevel: 0
            )
        }

        return imageData
    }

    func dispose() {
        stopRendering()
        texture = nil
        depthTexture = nil
        vertexBuffer = nil
        indexBuffer = nil
        uniformBuffer = nil
        pipelineState = nil
        commandQueue = nil
        pixelBuffer = nil
        textureCache = nil
        device = nil
    }

    // FlutterTexture protocol — returns CVPixelBuffer backed by Metal texture
    func copyPixelBuffer() -> Unmanaged<CVPixelBuffer>? {
        guard let pixelBuffer = pixelBuffer else { return nil }
        return Unmanaged.passRetained(pixelBuffer)
    }
}

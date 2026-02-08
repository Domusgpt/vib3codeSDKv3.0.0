Pod::Spec.new do |s|
  s.name             = 'vib3_flutter'
  s.version          = '2.0.1'
  s.summary          = 'VIB3+ 4D Visualization Engine for Flutter'
  s.description      = <<-DESC
High-performance 4D geometry visualization engine with Metal rendering,
6D rotation support, and native FFI bindings for Flutter iOS applications.
                       DESC
  s.homepage         = 'https://github.com/Domusgpt/vib34d-xr-quaternion-sdk'
  s.license          = { :type => 'MIT', :file => '../LICENSE' }
  s.author           = { 'Paul Phillips' => 'Paul@clearseassolutions.com' }
  s.source           = { :path => '.' }

  # Include native C++ FFI source (self-contained in flutter/src/)
  s.source_files     = 'Classes/**/*', '../src/**/*.{h,cpp}'
  s.public_header_files = '../src/**/*.h'
  s.dependency 'Flutter'
  s.platform         = :ios, '12.0'
  s.swift_version    = '5.0'

  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
    'EXCLUDED_ARCHS[sdk=iphonesimulator*]' => 'i386',
    'CLANG_CXX_LANGUAGE_STANDARD' => 'c++17',
    'CLANG_CXX_LIBRARY' => 'libc++',
    'HEADER_SEARCH_PATHS' => '"$(PODS_TARGET_SRCROOT)/../src"',
  }

  s.frameworks = 'Metal', 'MetalKit', 'QuartzCore'
end

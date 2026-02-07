cmake_minimum_required(VERSION 3.10)
project(vib3_flutter_library VERSION 1.7.0 LANGUAGES CXX)

add_library(vib3_flutter SHARED
  "../src/vib3_ffi.cpp"
)

target_include_directories(vib3_flutter PUBLIC
  "../src"
)

set_target_properties(vib3_flutter PROPERTIES
  CXX_STANDARD 17
  CXX_STANDARD_REQUIRED ON
  OUTPUT_NAME "vib3_core"
)

target_compile_definitions(vib3_flutter PRIVATE FLUTTER_PLUGIN_IMPL)

set(vib3_flutter_bundled_libraries
  "$<TARGET_FILE:vib3_flutter>"
  PARENT_SCOPE
)

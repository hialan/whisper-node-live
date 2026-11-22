cmake_minimum_required(VERSION 3.14)

project(whisper_node_live LANGUAGES C CXX)

set(WHISPER_BUILD_TESTS OFF CACHE BOOL "Build whisper.cpp tests" FORCE)
set(WHISPER_BUILD_EXAMPLES OFF CACHE BOOL "Build whisper.cpp examples" FORCE)

add_subdirectory(cpp/whisper.cpp)
add_subdirectory(native)

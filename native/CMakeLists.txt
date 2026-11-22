set(TARGET addon.node)

set(WHISPER_EXAMPLES_DIR "${PROJECT_SOURCE_DIR}/cpp/whisper.cpp/examples")

add_library(common STATIC
    "${WHISPER_EXAMPLES_DIR}/common.cpp"
    "${WHISPER_EXAMPLES_DIR}/common-ggml.cpp"
    "${WHISPER_EXAMPLES_DIR}/common-whisper.cpp"
    "${WHISPER_EXAMPLES_DIR}/grammar-parser.cpp"
)
target_include_directories(common PUBLIC "${WHISPER_EXAMPLES_DIR}")
target_link_libraries(common PRIVATE whisper ${CMAKE_DL_LIBS})
set_target_properties(common PROPERTIES POSITION_INDEPENDENT_CODE ON)

find_package(Threads REQUIRED)

add_library(${TARGET} SHARED ${CMAKE_JS_SRC} addon.cpp)
target_compile_definitions(${TARGET} PRIVATE NAPI_VERSION=4)
target_include_directories(${TARGET} PRIVATE
    ${CMAKE_JS_INC}
    "${WHISPER_EXAMPLES_DIR}"
)
set_target_properties(${TARGET} PROPERTIES
    PREFIX ""
    OUTPUT_NAME "addon"
    SUFFIX ".node"
    LIBRARY_OUTPUT_DIRECTORY "${CMAKE_BINARY_DIR}/Release"
)

# Include N-API wrappers
#==================================================================
execute_process(COMMAND node -p "require('node-addon-api').include"
        WORKING_DIRECTORY ${CMAKE_CURRENT_SOURCE_DIR}
        OUTPUT_VARIABLE NODE_ADDON_API_DIR
        RESULT_VARIABLE NODE_ADDON_API_RESULT
        OUTPUT_STRIP_TRAILING_WHITESPACE
        )
string(REPLACE "\"" "" NODE_ADDON_API_DIR ${NODE_ADDON_API_DIR})
if(NOT NODE_ADDON_API_RESULT STREQUAL "0")
    message(FATAL_ERROR "Could not locate node-addon-api. Run npm install first.")
endif()
target_include_directories(${TARGET} PRIVATE ${NODE_ADDON_API_DIR})

target_link_libraries(${TARGET} PRIVATE
    ${CMAKE_JS_LIB}
    common
    whisper
    Threads::Threads
)

if(MSVC AND CMAKE_JS_NODELIB_DEF AND CMAKE_JS_NODELIB_TARGET)
    # Generate node.lib
    execute_process(COMMAND ${CMAKE_AR} /def:${CMAKE_JS_NODELIB_DEF} /out:${CMAKE_JS_NODELIB_TARGET} ${CMAKE_STATIC_LINKER_FLAGS})
endif()

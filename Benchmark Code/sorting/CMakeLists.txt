cmake_minimum_required(VERSION 3.17 FATAL_ERROR)

project(local_gpu_sort_benchmark LANGUAGES CUDA CXX)

find_package(OpenMP REQUIRED)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_FLAGS_RELEASE "${CMAKE_CXX_FLAGS_RELEASE} -O3")
set(CMAKE_CXX_FLAGS "${CMAKE_CXX_FLAGS} -O3")

#build executable
add_executable(sort "src/sort.cu")

target_compile_options(sort PRIVATE --expt-extended-lambda)

if(OpenMP_CXX_FOUND)
        target_link_libraries(sort PUBLIC OpenMP::OpenMP_CXX)
endif()

set_property(TARGET sort PROPERTY CUDA_ARCHITECTURES 70 75 80 90 100)

target_include_directories(sort SYSTEM PRIVATE $ENV{CUDA_PATH}/include $CMAKE_CURRENT_SOURCE_DIR}/src)

#include <thrust/copy.h>
#include <thrust/sort.h>

#include <algorithm>
#include <iomanip>
#include <iostream>
#include <vector>

#include "argument_limits.cuh"
#include "cuda_error.cuh"
#include "data_generator.cuh"
#include "device_allocator.cuh"
#include "device_vector.cuh"
#include "host_vector.cuh"
#include "time_durations.cuh"

int main(int argc, char* argv[]) {
    cudaError_t err =  cudaFree(0);
    err = cudaSetDevice(0);
    if (argc != 3) {
        std::cout << "./local_gpu_sort_benchmark <num_elements> <gpu_id>\n";
        return 1;
    }

    const size_t num_elements = std::stoull(argv[1]);
    const int gpu_id = std::stoi(argv[2]);

    DataGenerator data_generator(ArgumentLimits::GetDefaultDistributionSeed());
    HostVector<int> elements(num_elements);

    data_generator.ComputeDistribution<int>(&elements[0], num_elements,
                                            ArgumentLimits::GetDefaultDistributionType());

    int initial_max_element = *std::max_element(elements.begin(), elements.end());

    cudaSetDevice(gpu_id);
    cudaDeviceSynchronize();

    cudaStream_t stream;
    cudaStreamCreateWithFlags(&stream, cudaStreamNonBlocking);

    DeviceVector<int> device_vector(num_elements);
    DeviceAllocator device_allocator;
    device_allocator.Malloc(sizeof(int) * num_elements + 128000000);

    thrust::copy(elements.begin(), elements.end(), device_vector.begin());

    // Only thrust::sort
    TimeDurations::Get()->Tic("local_sort_phase");
    thrust::sort(thrust::cuda::par(device_allocator).on(stream),
                 device_vector.begin(), device_vector.end());
    CheckCudaError(cudaStreamSynchronize(stream));
    TimeDurations::Get()->Toc("local_sort_phase");

    thrust::copy(device_vector.begin(), device_vector.end(), elements.begin());

    device_allocator.Free();

    std::cout << num_elements << ",\"thrust::sort\"," << gpu_id << "," 
              << std::fixed << std::setprecision(9)
              << TimeDurations::Get()->durations["local_sort_phase"].count() << "\n";

    if (!std::is_sorted(elements.begin(), elements.end()) ||
        *std::max_element(elements.begin(), elements.end()) != initial_max_element) {
        std::cout << "Error: Invalid sort order.\n";
    }

    return 0;
}


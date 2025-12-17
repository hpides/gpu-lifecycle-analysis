// Description of all the tooltips (D_ prefix)
const D_SCALING_WORKLOAD = 'The workload scales proportionally to the increase in performance, resulting in the same utilization level.'
const D_SCALING_UTILIZATION = 'The utilization of the stronger hardware is scaled down to match the output of the weaker hardware.'
const D_SCALING_EMISSIONS = 'The current server’s operational carbon is scaled according to the relative performance indicator to reflect replacing multiple instances with one new server.';

export const D_EMBODIED_CARBON = 'CO2 and other greenhouse gas emissions during production, transport, and end-of-life of server components.'
export const D_OPERATIONAL_CARBON = 'CO2 and other greenhouse gas emissions resulting from the energy consumption of servers during their lifetime.'

const D_FP16 = 'Measures half-precision (16-bit) floating point performance, commonly used in deep learning training and inference.';

const D_FP32 = 'Measures single-precision (32-bit) floating point performance, representing general-purpose GPU compute workloads such as scientific simulations, graphics, and machine learning tasks.';

const D_FP64 = 'Measures double-precision (64-bit) floating point performance, critical for high-performance computing workloads such as physics simulations, climate modeling.';

const D_MATRIX_MULTIPLICATION = 'A core operation in scientific computing and machine learning, reflecting sustained floating-point throughput under highly parallel GPU workloads.'

const D_TPCXAI = 'An industry-standard benchmark for end-to-end AI workloads. Only GPU-accelerated use cases are executed, with performance measured at a given scale factor of 10.'

const D_SORTING = 'A large-scale data processing workload using Radix sort, highlighting GPU performance for memory-intensive and highly parallel sorting operations.'

// order of these matter
export const WORKLOAD_EXPLANATIONS: string[] = [ D_FP16, D_FP32, D_FP64, D_MATRIX_MULTIPLICATION, D_SORTING, D_TPCXAI ]
export const SCALING_EXPLANATIONS: string[] = [ D_SCALING_WORKLOAD, D_SCALING_UTILIZATION, D_SCALING_EMISSIONS ];

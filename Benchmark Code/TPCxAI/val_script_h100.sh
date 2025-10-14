#!/bin/bash
#SBATCH --job-name=tpcxai-validation-h100
#SBATCH --partition=aisc
#SBATCH --mem=128GB
#SBATCH --cpus-per-task=8
#SBATCH --gpus=h100:1
#SBATCH --output=logs/h100/tpcxai-validation-%j.out
#SBATCH --error=logs/h100/tpcxai-validation-%j.err
#SBATCH --account=sci-rabl-sustain-data-mgmt
#SBATCH --time=08:00:00

echo "Job started on $(hostname) at $(date)"

# Monitor GPU usage every 0.5s in the background
INTERVAL=0.5
echo "Sampling GPU metrics every ${INTERVAL}s"
nvidia-smi --query-gpu=timestamp,utilization.gpu,power.draw,utilization.memory --format=csv,nounits -lms 500 > "logs/a100/gpu_stats_a100.csv" &
SMI_PID=$!

# Start the container and execute everything inside it
enroot start --root --mount tpc:/app/tpcx-ai --mount mounts/cache:/root/.cache --mount mounts/opt:/opt/conda/pkgs --mount mounts/root:/root/.conda/pkgs --mount mounts/scalismo:/root/.scalismo --mount mounts/surprise_data:/root/.surprise_data tpcxgpu /bin/bash << 'EOF'
   echo "Inside container: $(hostname) at $(date)"
   cd tpcx-ai
   /bin/bash setenv.sh
   /bin/bash TPCx-AI_Benchmarkrun.sh
EOF

# Stop GPU monitoring
kill $SMI_PID
echo "GPU monitoring stopped."

echo "Job ended at $(date)"


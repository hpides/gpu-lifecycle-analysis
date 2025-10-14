#!/bin/bash
#SBATCH --job-name=thrust-bench-a1o0
#SBATCH --partition=gpu
#SBATCH --gpus=a100:1
#SBATCH --nodelist=gx02
#SBATCH --output=logs/thrust-bench-%j.out
#SBATCH --error=logs/thrust-bench-%j.err
#SBATCH --account=sci-rabl-sustain-data-mgmt
#SBATCH --mem=64G
#SBATCH --time=08:00:00
#SBATCH --mail-type=END,FAIL

INTERVAL=0.05

echo "Job started on $(hostname) at $(date)"
echo "Sampling GPU metrics every ${INTERVAL}s"

#start gpu monitoring
nvidia-smi --query-gpu=timestamp,utilization.gpu,power.draw,utilization.memory --format=csv,nounits -lms 50 > "logs/gpu_stats-log_a100" & SMI_PID=$!

./sort 1000000000 0


kill $SMI_PID

echo "Job ended at $(date)"

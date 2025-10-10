#!/bin/bash -eux
#SBATCH --job-name=matmul-benchmark
#SBATCH --output=matmul-benchmark-gh200-%j.out
#SBATCH --error=matmul-benchmark-gh200-%j.err
#SBATCH --partition=gpu # -p
#SBATCH --nodelist=ga01
#SBATCH --gres=gpu:1 
#SBATCH --account=sci-rabl-sustain-data-mgmt
#SBATCH --mem=32G                      # memory per job
#SBATCH --time=02:00:00               # max runtime
#SBATCH --mail-type=END,FAIL
#SBATCH --mail-user=nikolas.hoellerl@student.hpi.de
#SBATCH --container-image=nikolas29012/my-cuda-python:12.8.0
#SBATCH --container-mounts=/sc/home/nikolas.hoellerl:/mnt

export ENROOT_DATA_PATH=/scratch/$USER/enroot/data
export ENROOT_CACHE_PATH=/scratch/$USER/enroot/cache
mkdir -p $ENROOT_DATA_PATH $ENROOT_CACHE_PATH

nvcc --version
nvidia-smi

# Monitor GPU usage every 0.1s in the background
INTERVAL=0.1
echo "Sampling GPU metrics every ${INTERVAL} for GH200"
LOGDIR="/mnt/logs"
mkdir -p "$LOGDIR"
nvidia-smi --query-gpu=timestamp,utilization.gpu,power.draw,utilization.memory \
  --format=csv,nounits -lms 100 > "$LOGDIR/00.csv" & SMI_PID=$!

cd /mnt
python3 matmul_benchmark.py

# Stop GPU monitoring
kill $SMI_PID || true
echo "GPU monitoring stopped.

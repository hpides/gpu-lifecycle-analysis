import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# List your CSV file paths
csv_files = [
    r"D:\GitHub\sdm-project-sose25\benchmarks\sorting_results_2080ti.csv",
    r"D:\GitHub\sdm-project-sose25\benchmarks\sorting_results_a40.csv",
    r"D:\GitHub\sdm-project-sose25\benchmarks\sorting_results_a100.csv",
    r"D:\GitHub\sdm-project-sose25\benchmarks\sorting_results_b200.csv",
    r"D:\GitHub\sdm-project-sose25\benchmarks\sorting_results_v100.csv"
]
gpu_names = [
    "2080 Ti",
    "A40",
    "A100",
    "B200",
    "V100"
]
sns.set(style="whitegrid")
plt.figure(figsize=(10, 6))

# Store min/max for axis scaling
all_x = []
all_y = []

for i, csv_file in enumerate(csv_files):
    df = pd.read_csv(csv_file)
    df.columns = df.columns.str.strip()
    df['Keys_Million'] = df['Keys'] / 1_000_000
    all_x.extend(df['Keys_Million'])
    all_y.extend(df['Avg. Mkeys/s'])
    sns.lineplot(x="Keys_Million", y="Avg. Mkeys/s", data=df, marker="o", label=gpu_names[i])

# Set axis limits for consistent scales
plt.xlim(min(all_x), max(all_x))
plt.ylim(min(all_y), max(all_y))

plt.title("Sorting Performance Comparison")
plt.xlabel("Number of Keys (Millions)")
plt.ylabel("Average MKeys/s")
plt.legend()
plt.tight_layout()
plt.show()


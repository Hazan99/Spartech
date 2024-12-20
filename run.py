import os
import time
import subprocess
import random

# Simulate creating or editing a file
def simulate_file_activity(directory):
    print("Simulating file activity...")
    filename = os.path.join(directory, f"file_{random.randint(1, 100)}.txt")
    with open(filename, "w") as f:
        f.write("This is a simulated file.\n")
        f.write(f"Edited at {time.ctime()}\n")
    print(f"Created/edited file: {filename}")
    time.sleep(random.uniform(1, 3))  # Random delay to mimic user behavior


# Simulate running a terminal command
def simulate_terminal_command(command):
    print(f"Simulating terminal command: {command}")
    result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Command output:\n{result.stdout.decode('utf-8')}")
    if result.stderr:
        print(f"Command error:\n{result.stderr.decode('utf-8')}")
    time.sleep(random.uniform(1, 3))  # Random delay


# Simulate navigating directories
def simulate_directory_navigation(start_dir):
    print("Simulating directory navigation...")
    subdirs = [os.path.join(start_dir, d) for d in os.listdir(start_dir) if os.path.isdir(os.path.join(start_dir, d))]
    if subdirs:
        chosen_dir = random.choice(subdirs)
        print(f"Navigating to directory: {chosen_dir}")
        os.chdir(chosen_dir)
        time.sleep(random.uniform(1, 3))  # Random delay
    else:
        print("No subdirectories to navigate to.")


# Main function
def simulate_codespace_activity():
    workspace_dir = os.getcwd()  # Start in the current directory
    print(f"Starting simulation in: {workspace_dir}")

    try:
        for _ in range(5):  # Simulate 5 user activities
            activity = random.choice(["file", "command", "navigate"])
            if activity == "file":
                simulate_file_activity(workspace_dir)
            elif activity == "command":
                simulate_terminal_command(random.choice(["ls", "pwd", "echo Simulating user activity..."]))
            elif activity == "navigate":
                simulate_directory_navigation(workspace_dir)

            print("\n--- Activity Completed ---\n")
    except Exception as e:
        print(f"An error occurred: {e}")


# Run the simulation
if __name__ == "__main__":
    simulate_codespace_activity()

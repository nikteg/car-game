#!/bin/bash

# Usage: ./build_tar.sh [output_file]
# If no output file is specified, it defaults to ~/Desktop/car-game.tar.gz

set -euo pipefail  # Exit on error, unset variables, or pipeline failures.

output_file="${1:-$HOME/Desktop/car-game.tar.gz}"
echo "Creating tarball..."
tar --no-xattr --disable-copyfile --exclude='node_modules' --exclude='dist' --exclude='*.sh' -czvf "$output_file" .dockerignore ./*
echo "Tarball creation completed successfully. Output file: $output_file"

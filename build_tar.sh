#!/bin/bash

# Usage: ./build_tar.sh [output_file]
# If no output file is specified, it defaults to ~/Desktop/motorcycle.tar.gz

set -euo pipefail  # Exit on error, unset variables, or pipeline failures.

output_file="${1:-$HOME/Desktop/motorcycle.tar.gz}"
echo "Creating tarball..."
tar --no-xattr --disable-copyfile -czvf "$output_file" Dockerfile .dockerignore public/
echo "Tarball creation completed successfully. Output file: $output_file"

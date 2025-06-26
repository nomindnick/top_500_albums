#!/bin/bash

echo "Setting up pre-commit hooks..."

# Install pre-commit
echo "Installing pre-commit..."
pip3 install --user pre-commit

# Install the git hook scripts
echo "Installing git hooks..."
~/.local/bin/pre-commit install

# Optional: Run against all files to check current state
echo "Running pre-commit against all files (this may take a moment)..."
~/.local/bin/pre-commit run --all-files || true

echo "Pre-commit hooks are now installed!"
echo "They will run automatically on git commit."
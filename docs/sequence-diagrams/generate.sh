#!/bin/bash
# Script to regenerate sequence diagrams

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PLANTUML_JAR="/tmp/plantuml-1.2024.0.jar"

# Check if PlantUML jar exists
if [ ! -f "$PLANTUML_JAR" ]; then
    echo "Downloading PlantUML..."
    wget -O "$PLANTUML_JAR" "https://github.com/plantuml/plantuml/releases/latest/download/plantuml.jar"
fi

cd "$SCRIPT_DIR"

echo "Generating PNG images..."
java -jar "$PLANTUML_JAR" -tpng *.puml

echo "Generating SVG images..."
java -jar "$PLANTUML_JAR" -tsvg *.puml

echo "Validating diagrams..."
java -jar "$PLANTUML_JAR" -checkonly *.puml

echo "Done! Generated images:"
ls -la *.png *.svg
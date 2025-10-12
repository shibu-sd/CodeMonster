#!/bin/sh
# Java runner script for CodeMonster Judge (Codeforces-style)


ulimit -t 10

JAVA_OPTS=${JAVA_OPTS:-"-Xmx256m -Xms64m -XX:+UseSerialGC"}

if [ ! -f "/workspace/input.txt" ]; then
    javac -cp /workspace /workspace/Solution.java 2>/tmp/compile_error.txt
    
    if [ $? -ne 0 ]; then
        echo "{\"success\": false, \"error\": \"Compilation Error: $(cat /tmp/compile_error.txt | tr '\n' ' ' | sed 's/\"/\\\\\"/g')\", \"output\": \"\", \"runtime\": 0}"
        exit 1
    fi
    
    java $JAVA_OPTS -cp /workspace:/ Runner
else
    javac -cp /workspace /workspace/Solution.java 2>/tmp/compile_error.txt
    
    if [ $? -ne 0 ]; then
        echo "{\"success\": false, \"error\": \"Compilation Error: $(cat /tmp/compile_error.txt | tr '\n' ' ' | sed 's/\"/\\\\\"/g')\", \"output\": \"\", \"runtime\": 0}"
        exit 1
    fi
    
    start_time=$(date +%s%3N)
    output=$(java $JAVA_OPTS -cp /workspace Solution < /workspace/input.txt 2>/dev/null)
    exit_code=$?
    end_time=$(date +%s%3N)
    runtime=$((end_time - start_time))
    
    if [ $exit_code -eq 0 ]; then
        escaped_output=$(echo "$output" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/ *$//')
        echo "{\"success\": true, \"error\": null, \"output\": \"$escaped_output\", \"runtime\": $runtime}"
    else
        # Runtime error
        escaped_error=$(echo "$output" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/ *$//')
        echo "{\"success\": false, \"error\": \"Runtime Error: $escaped_error\", \"output\": \"\", \"runtime\": $runtime}"
        exit 1
    fi
fi

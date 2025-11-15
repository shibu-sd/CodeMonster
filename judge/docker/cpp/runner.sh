#!/bin/sh

# Set resource limits
ulimit -t 10  # CPU time limit: 10 seconds
ulimit -v 524288  # Virtual memory limit: 512MB

if [ ! -f "/workspace/input.txt" ]; then
    g++ -o /tmp/test_compile /workspace/solution.cpp -std=c++17 -O2 2>/tmp/compile_error.txt
    
    if [ $? -ne 0 ]; then
        echo "{\"success\": false, \"error\": \"Compilation Error: $(cat /tmp/compile_error.txt)\", \"output\": \"\", \"runtime\": 0}"
        exit 1
    fi
    
    echo "{\"success\": true, \"error\": null, \"output\": \"Compilation successful\", \"runtime\": 0}"
else
    g++ -o /tmp/solution /workspace/solution.cpp -std=c++17 -O2 2>/tmp/compile_error.txt
    
    if [ $? -ne 0 ]; then
        echo "{\"success\": false, \"error\": \"Compilation Error: $(cat /tmp/compile_error.txt)\", \"output\": \"\", \"runtime\": 0}"
        exit 1
    fi
    
    start_time=$(date +%s%3N)
    output=$(/tmp/solution < /workspace/input.txt 2>&1)
    exit_code=$?
    end_time=$(date +%s%3N)
    runtime=$((end_time - start_time))
    
    if [ $exit_code -eq 0 ]; then
        escaped_output=$(echo "$output" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/ *$//')
        echo "{\"success\": true, \"error\": null, \"output\": \"$escaped_output\", \"runtime\": $runtime}"
    else
        escaped_error=$(echo "$output" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | tr '\n' ' ' | sed 's/ *$//')
        echo "{\"success\": false, \"error\": \"Runtime Error: $escaped_error\", \"output\": \"\", \"runtime\": $runtime}"
        exit 1
    fi
fi
#!/usr/bin/env python3
"""
Python code runner for CodeMonster Judge System (Codeforces-style)
Executes user's complete Python program with stdin/stdout redirection
"""

import sys
import json
import traceback
import signal
import os
from io import StringIO
import resource

def set_limits():
    """Set resource limits for security"""
    try:
        # Limit virtual memory to 256MB (Docker will enforce actual limit)
        resource.setrlimit(resource.RLIMIT_AS, (256 * 1024 * 1024, 256 * 1024 * 1024))
        
        # Limit CPU time to 10 seconds
        resource.setrlimit(resource.RLIMIT_CPU, (10, 10))
        
        # Limit number of processes
        resource.setrlimit(resource.RLIMIT_NPROC, (32, 32))
        
        # Limit file size to 10MB
        resource.setrlimit(resource.RLIMIT_FSIZE, (10 * 1024 * 1024, 10 * 1024 * 1024))
        
    except (OSError, ValueError) as e:
        # Resource limits might not be available in all environments
        pass

def timeout_handler(signum, frame):
    """Handle timeout signal"""
    raise TimeoutError("Code execution timed out")

def execute_code():
    """Execute the user's complete Python program with stdin/stdout redirection"""
    try:
        # Set resource limits
        set_limits()
        
        # Set up timeout signal
        signal.signal(signal.SIGALRM, timeout_handler)
        signal.alarm(10)  # 10 second timeout
        
        # Read user code
        with open('/workspace/solution.py', 'r') as f:
            user_code = f.read()
        
        # Check if input file exists
        input_data = ""
        if os.path.exists('/workspace/input.txt'):
            with open('/workspace/input.txt', 'r') as f:
                input_data = f.read()
        
        # Redirect stdin to use input data
        original_stdin = sys.stdin
        sys.stdin = StringIO(input_data)
        
        # Capture stdout
        original_stdout = sys.stdout
        captured_output = StringIO()
        sys.stdout = captured_output
        
        # Execute the user's code
        # This will run the entire script, including any main() or top-level code
        exec(user_code, {
            '__name__': '__main__',
            '__builtins__': __builtins__,
        })
        
        # Get the output
        output = captured_output.getvalue().strip()
        
        # Restore stdout and stdin
        sys.stdout = original_stdout
        sys.stdin = original_stdin
        
        # Clear timeout
        signal.alarm(0)
        
        # Return successful result
        print(json.dumps({
            "success": True,
            "output": output,
            "error": None,
            "runtime": 0  # TODO: Measure actual runtime
        }))
        
    except TimeoutError:
        print(json.dumps({
            "success": False,
            "output": "",
            "error": "Time Limit Exceeded",
            "runtime": 10000
        }))
    except Exception as e:
        # Restore stdout if not already restored
        try:
            sys.stdout = original_stdout
            sys.stdin = original_stdin
        except:
            pass
        
        # Clear timeout
        signal.alarm(0)
        
        # Get error information
        error_msg = str(e)
        if hasattr(e, '__class__'):
            error_type = e.__class__.__name__
            if error_type in ['SyntaxError', 'IndentationError', 'TabError']:
                error_msg = f"Syntax Error: {error_msg}"
            elif error_type in ['ImportError', 'ModuleNotFoundError']:
                error_msg = f"Import Error: {error_msg}"
            else:
                error_msg = f"Runtime Error: {error_msg}"
        
        print(json.dumps({
            "success": False,
            "output": "",
            "error": error_msg,
            "runtime": 0
        }))

if __name__ == "__main__":
    execute_code()
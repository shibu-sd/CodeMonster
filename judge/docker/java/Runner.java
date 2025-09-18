import java.io.*;
import java.util.concurrent.*;

/**
 * Java code runner for CodeMonster Judge System (Codeforces-style)
 * Executes user's complete Java program with stdin/stdout redirection
 */
public class Runner {
    private static final int TIMEOUT_SECONDS = 10;
    
    public static void main(String[] args) {
        try {
            Runner runner = new Runner();
            runner.executeCode();
        } catch (Exception e) {
            System.out.println("{\"success\": false, \"error\": \"System Error: " + 
                             e.getMessage().replace("\"", "\\\"") + "\", \"output\": \"\", \"runtime\": 0}");
        }
    }
    
    public void executeCode() {
        long startTime = System.currentTimeMillis();
        
        try {
            // Check if this is a compilation test or execution test
            File inputFile = new File("/workspace/input.txt");
            
            if (!inputFile.exists()) {
                // Compilation test - just verify the code compiles
                long runtime = System.currentTimeMillis() - startTime;
                System.out.println("{\"success\": true, \"error\": null, \"output\": \"Compilation successful\", \"runtime\": " + runtime + "}");
                return;
            }
            
            // This runner should not be used for execution in Codeforces style
            // The compiled user program will be executed directly
            long runtime = System.currentTimeMillis() - startTime;
            System.out.println("{\"success\": false, \"error\": \"This runner should only be used for compilation testing\", \"output\": \"\", \"runtime\": " + runtime + "}");
            
        } catch (Exception e) {
            long runtime = System.currentTimeMillis() - startTime;
            String errorMsg = e.getMessage();
            if (errorMsg == null) {
                errorMsg = e.getClass().getSimpleName();
            }
            
            System.out.println("{\"success\": false, \"error\": \"Runtime Error: " + 
                             errorMsg.replace("\"", "\\\"") + "\", \"output\": \"\", \"runtime\": " + runtime + "}");
        }
    }
}
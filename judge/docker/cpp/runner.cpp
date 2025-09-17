#include <iostream>
#include <fstream>
#include <string>
#include <chrono>
#include <cstdlib>

using namespace std;

int main() {
    auto startTime = chrono::high_resolution_clock::now();
    
    try {
        ifstream inputFile("/workspace/input.txt");
        if (!inputFile.is_open()) {
            auto endTime = chrono::high_resolution_clock::now();
            auto runtime = chrono::duration_cast<chrono::milliseconds>(endTime - startTime).count();
            
            cout << "{\"success\": true, \"error\": null, \"output\": \"Compilation successful\", \"runtime\": " << runtime << "}" << endl;
            return 0;
        }
        
        inputFile.close();
        
        auto endTime = chrono::high_resolution_clock::now();
        auto runtime = chrono::duration_cast<chrono::milliseconds>(endTime - startTime).count();
        
        cout << "{\"success\": false, \"error\": \"This runner should only be used for compilation testing\", \"output\": \"\", \"runtime\": " << runtime << "}" << endl;
        return 1;
        
    } catch (const exception& e) {
        auto endTime = chrono::high_resolution_clock::now();
        auto runtime = chrono::duration_cast<chrono::milliseconds>(endTime - startTime).count();
        
        cout << "{\"success\": false, \"error\": \"Runtime Error: " << e.what() << "\", \"output\": \"\", \"runtime\": " << runtime << "}" << endl;
        return 1;
    }
}
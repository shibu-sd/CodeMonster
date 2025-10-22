import { PrismaClient, Language } from "@prisma/client";

const prisma = new PrismaClient();

export async function updateStarterCode(): Promise<void> {
    console.log("🔄 Updating starter code for all problems...");

    try {
        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // Get all problems
        const problems = await prisma.problem.findMany({
            include: {
                starterCode: true,
            },
        });

        console.log(`📝 Found ${problems.length} problems to update`);

        // Define starter code templates for each problem type
        const twoSumStarterCode = {
            [Language.PYTHON]: `# Read input
n = int(input())
nums = list(map(int, input().split()))
target = int(input())

# TODO: Write your solution here
# Find two numbers in the array that add up to target
# Return their indices (0-based)

# Example:
# def two_sum(nums, target):
#     # Your code here
#     return [i, j]

# result = two_sum(nums, target)
# print(result[0], result[1])`,
            [Language.JAVA]: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        int target = sc.nextInt();

        // TODO: Write your solution here
        // Find two numbers that add up to target
        // Return their indices as space-separated values

        sc.close();
    }
}`,
            [Language.JAVASCRIPT]: `// Read input (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');

const n = parseInt(input[0]);
const nums = input[1].split(' ').map(Number);
const target = parseInt(input[2]);

// TODO: Write your solution here
// Find two numbers that add up to target
// Return their indices as space-separated values

// Example:
// function twoSum(nums, target) {
//     // Your code here
// }

// const result = twoSum(nums, target);
// console.log(result[0], result[1]);`,
            [Language.TYPESCRIPT]: `// Read input (Node.js)
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split('\\n');

const n = parseInt(input[0]);
const nums: number[] = input[1].split(' ').map(Number);
const target: number = parseInt(input[2]);

// TODO: Write your solution here
// Find two numbers that add up to target
// Return their indices as space-separated values

// function twoSum(nums: number[], target: number): number[] {
//     // Your code here
// }

// const result = twoSum(nums, target);
// console.log(result[0], result[1]);`,
            [Language.CPP]: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int n;
    cin >> n;

    vector<int> nums(n);
    for (int i = 0; i < n; i++) {
        cin >> nums[i];
    }

    int target;
    cin >> target;

    // TODO: Write your solution here
    // Find two numbers that add up to target
    // Print their indices as space-separated values

    return 0;
}`,
            [Language.C]: `#include <stdio.h>

int main() {
    int n;
    scanf("%d", &n);

    int nums[n];
    for (int i = 0; i < n; i++) {
        scanf("%d", &nums[i]);
    }

    int target;
    scanf("%d", &target);

    // TODO: Write your solution here
    // Find two numbers that add up to target
    // Print their indices as space-separated values

    return 0;
}`,
        };

        const aPlusBStarterCode = {
            [Language.PYTHON]: `# Read two integers from input
a, b = map(int, input().split())

# TODO: Calculate and output their sum
# Example:
# result = a + b
# print(result)`,
            [Language.JAVA]: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        int a = sc.nextInt();
        int b = sc.nextInt();

        // TODO: Calculate and output the sum
        // int result = a + b;
        // System.out.println(result);

        sc.close();
    }
}`,
            [Language.JAVASCRIPT]: `// Read input (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(' ');

const a = parseInt(input[0]);
const b = parseInt(input[1]);

// TODO: Calculate and output the sum
// const result = a + b;
// console.log(result);`,
            [Language.TYPESCRIPT]: `// Read input (Node.js)
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split(' ');

const a: number = parseInt(input[0]);
const b: number = parseInt(input[1]);

// TODO: Calculate and output the sum
// const result = a + b;
// console.log(result);`,
            [Language.CPP]: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // TODO: Calculate and output the sum
    // int result = a + b;
    // cout << result << endl;

    return 0;
}`,
            [Language.C]: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);

    // TODO: Calculate and output the sum
    // int result = a + b;
    // printf("%d\\n", result);

    return 0;
}`,
        };

        const validParenthesesStarterCode = {
            [Language.PYTHON]: `# Read input string
s = input().strip()

# TODO: Write your solution here
# Check if the string contains valid parentheses
# Return "true" if valid, "false" otherwise

# Example:
# def is_valid(s):
#     # Your code here
#     return True/False
#
# if is_valid(s):
#     print("true")
# else:
#     print("false")`,
            [Language.JAVA]: `import java.util.*;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);

        String s = sc.nextLine().trim();

        // TODO: Write your solution here
        // Check if the string contains valid parentheses
        // Return "true" if valid, "false" otherwise

        sc.close();
    }
}`,
            [Language.JAVASCRIPT]: `// Read input (Node.js)
const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

// TODO: Write your solution here
// Check if the string contains valid parentheses
// Return "true" if valid, "false" otherwise

// function isValid(s) {
//     // Your code here
// }

// console.log(isValid(s) ? "true" : "false");`,
            [Language.TYPESCRIPT]: `// Read input (Node.js)
import * as fs from 'fs';
const s: string = fs.readFileSync(0, 'utf-8').trim();

// TODO: Write your solution here
// Check if the string contains valid parentheses
// Return "true" if valid, "false" otherwise

// function isValid(s: string): boolean {
//     // Your code here
// }

// console.log(isValid(s) ? "true" : "false");`,
            [Language.CPP]: `#include <iostream>
#include <string>
#include <stack>
using namespace std;

int main() {
    string s;
    getline(cin, s);

    // TODO: Write your solution here
    // Check if the string contains valid parentheses
    // Return "true" if valid, "false" otherwise

    return 0;
}`,
            [Language.C]: `#include <stdio.h>
#include <string.h>
#include <stdbool.h>

bool isValid(const char* s) {
    // TODO: Write your solution here
    // Check if the string contains valid parentheses
    // Return true if valid, false otherwise
}

int main() {
    char s[10000];
    fgets(s, sizeof(s), stdin);

    // Remove trailing newline
    s[strcspn(s, "\\n")] = '\\0';

    // TODO: Print result
    // if (isValid(s)) {
    //     printf("true\\n");
    // } else {
    //     printf("false\\n");
    // }

    return 0;
}`,
        };

        for (const problem of problems) {
            console.log(`📝 Updating starter code for: ${problem.title}`);

            await prisma.starterCode.deleteMany({
                where: { problemId: problem.id },
            });

            let starterCodeTemplate: Record<Language, string>;

            if (problem.slug === "two-sum") {
                starterCodeTemplate = twoSumStarterCode;
            } else if (problem.slug === "a-plus-b") {
                starterCodeTemplate = aPlusBStarterCode;
            } else if (problem.slug === "valid-parentheses") {
                starterCodeTemplate = validParenthesesStarterCode;
            } else {
                console.log(
                    `⚠️  Unknown problem slug: ${problem.slug}, skipping`
                );
                continue;
            }

            for (const [language, code] of Object.entries(
                starterCodeTemplate
            )) {
                await prisma.starterCode.create({
                    data: {
                        problemId: problem.id,
                        language: language as Language,
                        code: code,
                    },
                });
            }

            console.log(`✅ Updated starter code for: ${problem.title}`);
        }

        console.log("🎉 Successfully updated starter code for all problems!");
    } catch (error) {
        console.error("❌ Error updating starter code:", error);
        throw error;
    } finally {
        await prisma.$disconnect();
        console.log("🔌 Database disconnected");
    }
}

if (require.main === module) {
    updateStarterCode()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

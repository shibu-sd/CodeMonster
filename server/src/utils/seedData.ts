import { PrismaClient } from "@prisma/client";
import { Difficulty, Language } from "@prisma/client";

const prisma = new PrismaClient();

export async function seedSampleProblems(): Promise<void> {
    console.log("🌱 Seeding Codeforces-style problems...");

    const existingProblems = await prisma.problem.count();
    if (existingProblems > 0) {
        console.log(
            `ℹ️ Found ${existingProblems} existing problems. Skipping seeding.`
        );
        return;
    }
    console.log("ℹ️ No existing problems found. Creating sample problems...");

    // Problem 1: Two Sum (Array problem)
    console.log("📝 Creating Two Sum problem...");
    await prisma.problem.create({
        data: {
            title: "Two Sum",
            slug: "two-sum",
            description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.

**Example 1:**
\`\`\`
Input: 
4
2 7 11 15
9
Output: 
0 1
\`\`\`

**Example 2:**
\`\`\`
Input:
3
3 2 4
6
Output:
1 2
\`\`\`

**Input Format:**
- First line: n (number of elements)
- Second line: n space-separated integers (the array)
- Third line: target integer

**Output Format:**
- Two space-separated integers representing the indices`,
            difficulty: Difficulty.EASY,
            tags: ["array", "hash-table"],
            timeLimit: 2000,
            memoryLimit: 128,
            testCases: {
                create: [
                    {
                        input: "4\n2 7 11 15\n9",
                        output: "0 1",
                        isHidden: false,
                    },
                    {
                        input: "3\n3 2 4\n6",
                        output: "1 2",
                        isHidden: false,
                    },
                    {
                        input: "2\n3 3\n6",
                        output: "0 1",
                        isHidden: false,
                    },
                    {
                        input: "5\n-1 -2 -3 -4 -5\n-8",
                        output: "2 4",
                        isHidden: true,
                    },
                ],
            },
            starterCode: {
                create: [
                    {
                        language: Language.PYTHON,
                        code: `# Read input
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
                    },
                    {
                        language: Language.JAVA,
                        code: `import java.util.*;

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
                    },
                    {
                        language: Language.JAVASCRIPT,
                        code: `// Read input (Node.js)
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
                    },
                    {
                        language: Language.TYPESCRIPT,
                        code: `// Read input (Node.js)
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
                    },
                    {
                        language: Language.CPP,
                        code: `#include <iostream>
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
                    },
                    {
                        language: Language.C,
                        code: `#include <stdio.h>

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
                    },
                ],
            },
        },
        include: {
            testCases: true,
            starterCode: true,
        },
    });
    console.log("✅ Two Sum problem created");

    // Problem 2: Simple Addition (Basic I/O)
    console.log("📝 Creating Simple Addition problem...");
    await prisma.problem.create({
        data: {
            title: "A + B Problem",
            slug: "a-plus-b",
            description: `Given two integers A and B, output their sum.

This is a classic introductory problem to get familiar with input/output format.

**Example:**
\`\`\`
Input: 
3 5
Output:
8
\`\`\`

**Input Format:**
- Single line: two space-separated integers A and B

**Output Format:**
- Single integer: A + B`,
            difficulty: Difficulty.EASY,
            tags: ["math", "implementation"],
            timeLimit: 1000,
            memoryLimit: 64,
            testCases: {
                create: [
                    {
                        input: "3 5",
                        output: "8",
                        isHidden: false,
                    },
                    {
                        input: "10 20",
                        output: "30",
                        isHidden: false,
                    },
                    {
                        input: "-5 3",
                        output: "-2",
                        isHidden: false,
                    },
                    {
                        input: "1000000 2000000",
                        output: "3000000",
                        isHidden: true,
                    },
                ],
            },
            starterCode: {
                create: [
                    {
                        language: Language.PYTHON,
                        code: `# Read two integers from input
a, b = map(int, input().split())

# TODO: Calculate and output their sum
# Example:
# result = a + b
# print(result)`,
                    },
                    {
                        language: Language.JAVA,
                        code: `import java.util.Scanner;

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
                    },
                    {
                        language: Language.JAVASCRIPT,
                        code: `// Read input (Node.js)
const fs = require('fs');
const input = fs.readFileSync(0, 'utf-8').trim().split(' ');

const a = parseInt(input[0]);
const b = parseInt(input[1]);

// TODO: Calculate and output the sum
// const result = a + b;
// console.log(result);`,
                    },
                    {
                        language: Language.TYPESCRIPT,
                        code: `// Read input (Node.js)
import * as fs from 'fs';
const input = fs.readFileSync(0, 'utf-8').trim().split(' ');

const a: number = parseInt(input[0]);
const b: number = parseInt(input[1]);

// TODO: Calculate and output the sum
// const result = a + b;
// console.log(result);`,
                    },
                    {
                        language: Language.CPP,
                        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;

    // TODO: Calculate and output the sum
    // int result = a + b;
    // cout << result << endl;

    return 0;
}`,
                    },
                    {
                        language: Language.C,
                        code: `#include <stdio.h>

int main() {
    int a, b;
    scanf("%d %d", &a, &b);

    // TODO: Calculate and output the sum
    // int result = a + b;
    // printf("%d\\n", result);

    return 0;
}`,
                    },
                ],
            },
        },
        include: {
            testCases: true,
            starterCode: true,
        },
    });
    console.log("✅ A + B problem created");

    // Problem 3: Valid Parentheses (String problem)
    console.log("📝 Creating Valid Parentheses problem...");
    await prisma.problem.create({
        data: {
            title: "Valid Parentheses",
            slug: "valid-parentheses",
            description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.

**Example 1:**
\`\`\`
Input: 
()
Output:
true
\`\`\`

**Example 2:**
\`\`\`
Input:
()[]{} 
Output:
true
\`\`\`

**Example 3:**
\`\`\`
Input:
(]
Output:
false
\`\`\`

**Input Format:**
- Single line: string s (1 ≤ |s| ≤ 10^4)

**Output Format:**
- Single line: "true" or "false"`,
            difficulty: Difficulty.EASY,
            tags: ["string", "stack"],
            timeLimit: 1000,
            memoryLimit: 128,
            testCases: {
                create: [
                    {
                        input: "()",
                        output: "true",
                        isHidden: false,
                    },
                    {
                        input: "()[]{}",
                        output: "true",
                        isHidden: false,
                    },
                    {
                        input: "(]",
                        output: "false",
                        isHidden: false,
                    },
                    {
                        input: "([)]",
                        output: "false",
                        isHidden: false,
                    },
                    {
                        input: "{[]}",
                        output: "true",
                        isHidden: true,
                    },
                ],
            },
            starterCode: {
                create: [
                    {
                        language: Language.PYTHON,
                        code: `# Read input string
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
                    },
                    {
                        language: Language.JAVA,
                        code: `import java.util.*;

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
                    },
                    {
                        language: Language.JAVASCRIPT,
                        code: `// Read input (Node.js)
const fs = require('fs');
const s = fs.readFileSync(0, 'utf-8').trim();

// TODO: Write your solution here
// Check if the string contains valid parentheses
// Return "true" if valid, "false" otherwise

// function isValid(s) {
//     // Your code here
// }

// console.log(isValid(s) ? "true" : "false");`,
                    },
                    {
                        language: Language.TYPESCRIPT,
                        code: `// Read input (Node.js)
import * as fs from 'fs';
const s: string = fs.readFileSync(0, 'utf-8').trim();

// TODO: Write your solution here
// Check if the string contains valid parentheses
// Return "true" if valid, "false" otherwise

// function isValid(s: string): boolean {
//     // Your code here
// }

// console.log(isValid(s) ? "true" : "false");`,
                    },
                    {
                        language: Language.CPP,
                        code: `#include <iostream>
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
                    },
                    {
                        language: Language.C,
                        code: `#include <stdio.h>
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
                    },
                ],
            },
        },
        include: {
            testCases: true,
            starterCode: true,
        },
    });
    console.log("✅ Valid Parentheses problem created");

    console.log("✅ Successfully seeded 3 Codeforces-style problems:");
    console.log("   - Two Sum (EASY)");
    console.log("   - A + B Problem (EASY)");
    console.log("   - Valid Parentheses (EASY)");
}

export async function seedTestUser(): Promise<void> {
    console.log("👤 Seeding test user...");

    // Create or update test user
    await prisma.user.upsert({
        where: { email: "test@codemonster.dev" },
        update: {},
        create: {
            clerkId: "test_user_clerk_id",
            email: "test@codemonster.dev",
            username: "testuser",
            firstName: "Test",
            lastName: "User",
        },
    });

    console.log("✅ Test user created");
}

export async function seedDatabase(): Promise<void> {
    try {
        console.log("🌱 Starting Codeforces-style database seeding...");

        await prisma.$connect();
        console.log("✅ Database connected successfully");

        // Seed problems
        await seedSampleProblems();

        // Seed test user
        await seedTestUser();

        console.log("🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("❌ Database seeding failed:", error);
        throw error;
    } finally {
        // Disconnect from database
        await prisma.$disconnect();
        console.log("🔌 Database disconnected");
    }
}

if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

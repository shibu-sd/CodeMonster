import { PrismaClient } from "@prisma/client";
import { Difficulty, Language } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Seed sample problems with Codeforces-style format
 */
export async function seedSampleProblems(): Promise<void> {
    console.log("🌱 Seeding Codeforces-style problems...");

    // Clear existing problems
    console.log("🗑️ Clearing existing problems...");
    await prisma.submission.deleteMany();
    await prisma.starterCode.deleteMany();
    await prisma.testCase.deleteMany();
    await prisma.problem.deleteMany();
    console.log("✅ Existing data cleared");

    // Problem 1: Two Sum (Array problem)
    console.log("📝 Creating Two Sum problem...");
    const twoSumProblem = await prisma.problem.create({
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

# Your solution here
# Print the two indices separated by space

# Example:
# i, j = find_two_sum(nums, target)
# print(i, j)`,
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
        
        // Your solution here
        // System.out.println(i + " " + j);
        
        sc.close();
    }
}`,
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
    
    // Your solution here
    // cout << i << " " << j << endl;
    
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
    const additionProblem = await prisma.problem.create({
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
                        code: `# Read two integers
a, b = map(int, input().split())

# Output their sum
print(a + b)`,
                    },
                    {
                        language: Language.JAVA,
                        code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int a = sc.nextInt();
        int b = sc.nextInt();
        
        System.out.println(a + b);
        
        sc.close();
    }
}`,
                    },
                    {
                        language: Language.CPP,
                        code: `#include <iostream>
using namespace std;

int main() {
    int a, b;
    cin >> a >> b;
    
    cout << a + b << endl;
    
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
    const parenthesesProblem = await prisma.problem.create({
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

# Your solution here
# Print "true" or "false"

# Example:
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
        
        // Your solution here
        // System.out.println(isValid(s) ? "true" : "false");
        
        sc.close();
    }
}`,
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
    
    // Your solution here
    // cout << (isValid(s) ? "true" : "false") << endl;
    
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

/**
 * Seed a test user for development
 */
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

/**
 * Main seeding function
 */
export async function seedDatabase(): Promise<void> {
    try {
        console.log("🌱 Starting Codeforces-style database seeding...");

        // Connect to database
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

// Run seeding if called directly
if (require.main === module) {
    seedDatabase()
        .then(() => process.exit(0))
        .catch(() => process.exit(1));
}

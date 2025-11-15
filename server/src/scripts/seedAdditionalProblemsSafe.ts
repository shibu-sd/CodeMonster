import { connectDatabase, disconnectDatabase } from "../utils/database";
import { PrismaClient } from "@prisma/client";
import { Difficulty, Language } from "@prisma/client";

const prisma = new PrismaClient();

async function runAdditionalSeed() {
    try {
        console.log("🌱 Starting additional problems seeding...");

        await connectDatabase();

        await seedAdditionalProblems();

        console.log("🎉 Additional problems seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await disconnectDatabase();
    }
}

export async function seedAdditionalProblems(): Promise<void> {
    console.log("🌱 Seeding/Updating additional Codeforces-style problems...");

    // Problem 1: Maximum Subarray Sum (Medium)
    await createOrUpdateProblem({
        title: "Maximum Subarray Sum",
        slug: "maximum-subarray-sum",
        description: `Given an array of integers, find the maximum sum of a contiguous subarray.

This is the classic Kadane's algorithm problem.

**Example 1:**
\`\`\`
Input: 
5
1 -2 3 4 -1
Output:
7
\`\`\`

**Example 2:**
\`\`\`
Input:
4
-1 -2 -3 -4
Output:
-1
\`\`\`

**Input Format:**
- First line: n (size of array, 1 ≤ n ≤ 10^5)
- Second line: n space-separated integers (-10^4 ≤ ai ≤ 10^4)

**Output Format:**
- Single integer: maximum subarray sum`,
        difficulty: Difficulty.MEDIUM,
        tags: ["array", "dp", "kadane"],
        timeLimit: 1000,
        memoryLimit: 128,
        testCases: [
            // Visible test cases (4)
            {
                input: "5\n1 -2 3 4 -1",
                output: "7",
                isHidden: false,
            },
            {
                input: "4\n-1 -2 -3 -4",
                output: "-1",
                isHidden: false,
            },
            {
                input: "1\n5",
                output: "5",
                isHidden: false,
            },
            {
                input: "2\n1 -1",
                output: "1",
                isHidden: false,
            },
            // Hidden test cases (11)
            {
                input: "6\n2 3 -2 4 -1 2",
                output: "8",
                isHidden: true,
            },
            {
                input: "8\n-2 -3 4 -1 -2 1 5 -3",
                output: "7",
                isHidden: true,
            },
            {
                input: "10\n1 2 3 4 5 6 7 8 9 10",
                output: "37",
                isHidden: true,
            },
            {
                input: "3\n-5 -4 -3",
                output: "-3",
                isHidden: true,
            },
            {
                input: "7\n100 1 200 300 400 500",
                output: "1500",
                isHidden: true,
            },
            {
                input: "4\n1 -1 1 -1",
                output: "2",
                isHidden: true,
            },
            {
                input: "5\n0 0 0 0 0",
                output: "0",
                isHidden: true,
            },
            {
                input: "8\n-1 2 -3 4 -5 6 -7 8",
                output: "8",
                isHidden: true,
            },
            {
                input: "11\n1 2 3 4 5 6 7 8 9 10 11",
                output: "66",
                isHidden: true,
            },
            {
                input: "1\n10000",
                output: "10000",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
n = int(input())
arr = list(map(int, input().split()))

# TODO: Implement Kadane's algorithm
# Find the maximum sum of any contiguous subarray
# Print the result`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        
        // TODO: Implement Kadane's algorithm
        // Find the maximum sum of any contiguous subarray
        // Print the result
        
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
    
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    // TODO: Implement Kadane's algorithm
    // Find the maximum sum of any contiguous subarray
    // Print the result
    
    return 0;
}`,
            },
        ],
    });

    // Problem 2: Merge Intervals (Medium)
    await createOrUpdateProblem({
        title: "Merge Intervals",
        slug: "merge-intervals",
        description: `Given an array of intervals where intervals[i] = [starti, endi], merge all overlapping intervals.

Return an array of the non-overlapping intervals that cover all the intervals in the input.

**Example 1:**
\`\`\`
Input: 
3
1 3
2 6
8 10
Output:
2
1 6
8 10
\`\`\`

**Example 2:**
\`\`\`
Input:
4
1 4
4 5
5 6
7 8
Output:
2
1 6
7 8
\`\`\`

**Input Format:**
- First line: n (number of intervals, 1 ≤ n ≤ 10^4)
- Next n lines: two integers start end (0 ≤ start ≤ end ≤ 10^5)

**Output Format:**
- First line: m (number of merged intervals)
- Next m lines: two integers start end for each merged interval`,
        difficulty: Difficulty.MEDIUM,
        tags: ["array", "sorting", "intervals"],
        timeLimit: 2000,
        memoryLimit: 256,
        testCases: [
            // Visible test cases (4)
            {
                input: "3\n1 3\n2 6\n8 10",
                output: "2\n1 6\n8 10",
                isHidden: false,
            },
            {
                input: "4\n1 4\n4 5\n5 6\n7 8",
                output: "2\n1 6\n7 8",
                isHidden: false,
            },
            {
                input: "1\n5 7",
                output: "1\n5 7",
                isHidden: false,
            },
            {
                input: "2\n2 4\n6 8",
                output: "2\n2 4\n6 8",
                isHidden: false,
            },
            // Hidden test cases (11)
            {
                input: "5\n1 3\n2 4\n5 7\n6 8\n9 10",
                output: "3\n1 4\n5 8\n9 10",
                isHidden: true,
            },
            {
                input: "6\n1 4\n2 5\n3 6\n4 7\n5 8\n6 9",
                output: "1\n1 9",
                isHidden: true,
            },
            {
                input: "3\n1 5\n2 6\n3 7",
                output: "1\n1 7",
                isHidden: true,
            },
            {
                input: "4\n1 2\n3 4\n5 6\n7 8",
                output: "4\n1 2\n3 4\n5 6\n7 8",
                isHidden: true,
            },
            {
                input: "4\n5 5\n10 15\n20 25\n30 45",
                output: "4\n5 5\n10 15\n20 25\n30 45",
                isHidden: true,
            },
            {
                input: "1\n0 1",
                output: "1\n0 1",
                isHidden: true,
            },
            {
                input: "6\n1 3\n2 4\n5 6\n7 8\n9 10\n11 12",
                output: "5\n1 4\n5 6\n7 8\n9 10\n11 12",
                isHidden: true,
            },
            {
                input: "2\n10 15\n20 25",
                output: "2\n10 15\n20 25",
                isHidden: true,
            },
            {
                input: "7\n1 5\n2 7\n3 9\n4 11\n5 13\n6 15\n7 17",
                output: "1\n1 17",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
n = int(input())
intervals = []
for _ in range(n):
    start, end = map(int, input().split())
    intervals.append([start, end])

# TODO: Merge overlapping intervals
# Print the number of merged intervals followed by each interval`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[][] intervals = new int[n][2];
        for (int i = 0; i < n; i++) {
            intervals[i][0] = sc.nextInt();
            intervals[i][1] = sc.nextInt();
        }
        
        // TODO: Merge overlapping intervals
        // Print the number of merged intervals followed by each interval
        
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
    
    vector<pair<int, int>> intervals(n);
    for (int i = 0; i < n; i++) {
        cin >> intervals[i].first >> intervals[i].second;
    }
    
    // TODO: Merge overlapping intervals
    // Print the number of merged intervals followed by each interval
    
    return 0;
}`,
            },
        ],
    });

    // Problem 3: Sliding Window Maximum (Hard)
    await createOrUpdateProblem({
        title: "Sliding Window Maximum",
        slug: "sliding-window-maximum",
        description: `Given an array of integers and a window size k, find the maximum value in each sliding window of size k.

A sliding window is a contiguous subarray of size k that moves from left to right by one position each time.

**Example 1:**
\`\`\`
Input: 
8
1 3 -1 -3 5 3 6 7
3
Output:
3 3 5 5 6 7
\`\`\`

**Example 2:**
\`\`\`
Input:
4
9 11 8 5
2
Output:
11 11 8
\`\`\`

**Input Format:**
- First line: n (size of array, 1 ≤ n ≤ 10^5)
- Second line: n space-separated integers (-10^9 ≤ ai ≤ 10^9)
- Third line: k (window size, 1 ≤ k ≤ n)

**Output Format:**
- Space-separated integers: maximum of each sliding window`,
        difficulty: Difficulty.HARD,
        tags: ["array", "deque", "sliding-window"],
        timeLimit: 2000,
        memoryLimit: 256,
        testCases: [
            // Visible test cases (4)
            {
                input: "8\n1 3 -1 -3 5 3 6 7\n3",
                output: "3 3 5 5 6 7",
                isHidden: false,
            },
            {
                input: "4\n9 11 8 5\n2",
                output: "11 11 8",
                isHidden: false,
            },
            {
                input: "5\n1 2 3 4 5\n5",
                output: "5",
                isHidden: false,
            },
            {
                input: "5\n5 4 3 2 1\n3",
                output: "5 4 3",
                isHidden: false,
            },
            // Hidden test cases (11)
            {
                input: "6\n6 5 4 3 2 1\n1",
                output: "6 5 4 3 2 1",
                isHidden: true,
            },
            {
                input: "10\n2 1 3 4 6 3 8 9 10 12\n4",
                output: "4 6 6 8 9 10 12",
                isHidden: true,
            },
            {
                input: "12\n1 2 3 4 5 6 7 8 9 10 11 12\n5",
                output: "5 6 7 8 9 10 11 12",
                isHidden: true,
            },
            {
                input: "7\n7 6 5 4 3 2 1\n2",
                output: "7 6 5 4 3 2",
                isHidden: true,
            },
            {
                input: "9\n9 8 7 6 5 4 3 2 1\n3",
                output: "9 8 7 6 5 4 3",
                isHidden: true,
            },
            {
                input: "4\n4 3 2 1\n1",
                output: "4 3 2 1",
                isHidden: true,
            },
            {
                input: "11\n11 10 9 8 7 6 5 4 3 2 1\n2",
                output: "11 10 9 8 7 6 5 4 3 2",
                isHidden: true,
            },
            {
                input: "15\n15 14 13 12 11 10 9 8 7 6 5 4 3 2 1\n5",
                output: "15 14 13 12 11 10 9 8 7 6 5",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `from collections import deque

# Read input
n = int(input())
arr = list(map(int, input().split()))
k = int(input())

# TODO: Implement sliding window maximum using deque
# Print the maximum of each sliding window as space-separated values`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;
import java.util.Deque;
import java.util.ArrayDeque;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] arr = new int[n];
        for (int i = 0; i < n; i++) {
            arr[i] = sc.nextInt();
        }
        int k = sc.nextInt();
        
        // TODO: Implement sliding window maximum using deque
        // Print the maximum of each sliding window as space-separated values
        
        sc.close();
    }
}`,
            },
            {
                language: Language.CPP,
                code: `#include <iostream>
#include <vector>
#include <deque>
using namespace std;

int main() {
    int n;
    cin >> n;
    
    vector<int> arr(n);
    for (int i = 0; i < n; i++) {
        cin >> arr[i];
    }
    
    int k;
    cin >> k;
    
    // TODO: Implement sliding window maximum using deque
    // Print the maximum of each sliding window as space-separated values
    
    return 0;
}`,
            },
        ],
    });

    console.log(
        "✅ Successfully seeded/updated 3 additional Codeforces-style problems:"
    );
    console.log(
        "   - Maximum Subarray Sum (MEDIUM) - 15 test cases (4 visible, 11 hidden)"
    );
    console.log(
        "   - Merge Intervals (MEDIUM) - 15 test cases (4 visible, 11 hidden)"
    );
    console.log(
        "   - Sliding Window Maximum (HARD) - 15 test cases (4 visible, 11 hidden)"
    );
}

async function createOrUpdateProblem(problemData: any) {
    // Check if problem exists
    const existing = await prisma.problem.findUnique({
        where: { slug: problemData.slug },
    });

    if (existing) {
        console.log(`📝 Updating ${problemData.title} problem...`);
        // Update existing problem
        const updated = await prisma.problem.update({
            where: { id: existing.id },
            data: {
                title: problemData.title,
                description: problemData.description,
                difficulty: problemData.difficulty,
                tags: problemData.tags,
                timeLimit: problemData.timeLimit,
                memoryLimit: problemData.memoryLimit,
            },
        });

        // Delete existing test cases
        await prisma.testCase.deleteMany({
            where: { problemId: existing.id },
        });

        // Delete existing starter code
        await prisma.starterCode.deleteMany({
            where: { problemId: existing.id },
        });

        // Create new test cases
        await prisma.testCase.createMany({
            data: problemData.testCases.map((tc: any) => ({
                ...tc,
                problemId: existing.id,
            })),
        });

        // Create new starter code
        await prisma.starterCode.createMany({
            data: problemData.starterCode.map((sc: any) => ({
                ...sc,
                problemId: existing.id,
            })),
        });

        console.log(`✅ ${problemData.title} problem updated`);
        return existing;
    } else {
        console.log(`📝 Creating ${problemData.title} problem...`);
        // Create new problem
        return await prisma.problem.create({
            data: {
                title: problemData.title,
                slug: problemData.slug,
                description: problemData.description,
                difficulty: problemData.difficulty,
                tags: problemData.tags,
                timeLimit: problemData.timeLimit,
                memoryLimit: problemData.memoryLimit,
                testCases: {
                    create: problemData.testCases,
                },
                starterCode: {
                    create: problemData.starterCode,
                },
            },
        });
    }
}

if (require.main === module) {
    runAdditionalSeed();
}

export { runAdditionalSeed };

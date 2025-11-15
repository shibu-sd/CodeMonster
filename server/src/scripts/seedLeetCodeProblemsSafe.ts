import { connectDatabase, disconnectDatabase } from "../utils/database";
import { PrismaClient } from "@prisma/client";
import { Difficulty, Language } from "@prisma/client";

const prisma = new PrismaClient();

async function runLeetCodeSeed() {
    try {
        console.log("🌱 Starting LeetCode problems seeding...");

        await connectDatabase();

        await seedLeetCodeProblems();

        console.log("🎉 LeetCode problems seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await disconnectDatabase();
    }
}

export async function seedLeetCodeProblems(): Promise<void> {
    console.log("🌱 Seeding/Updating LeetCode-style problems...");

    // Problem 1: Number of Islands (Medium)
    await createOrUpdateProblem({
        title: "Number of Islands",
        slug: "number-of-islands",
        description: `Given an m x n 2D binary grid which represents a map of '1's (land) and '0's (water), return number of islands.

An island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically. You may assume all four edges of grid are surrounded by water.

**Example 1:**
\`\`\`
Input: 
4 5
1 1 0 0 0
1 1 0 0 0
0 0 1 0 0
0 0 0 1 1
Output:
3
\`\`\`

**Example 2:**
\`\`\`
Input:
1 1
1
Output:
1
\`\`\`

**Input Format:**
- First line: m n (rows and columns, 1 ≤ m, n ≤ 300)
- Next m lines: n space-separated integers (0 or 1)

**Output Format:**
- Single integer: number of islands

**Constraints:**
- 1 ≤ m, n ≤ 300
- Grid consists only of '0's and '1's`,
        difficulty: Difficulty.MEDIUM,
        tags: ["graph", "dfs", "bfs", "matrix"],
        timeLimit: 3000,
        memoryLimit: 256,
        testCases: [
            // Visible test cases (4)
            {
                input: "4 5\n1 1 0 0 0\n1 1 0 0 0\n0 0 1 0 0\n0 0 0 1 1",
                output: "3",
                isHidden: false,
            },
            {
                input: "1 1\n1",
                output: "1",
                isHidden: false,
            },
            {
                input: "3 3\n1 1 1\n0 1 0\n1 1 1",
                output: "1",
                isHidden: false,
            },
            {
                input: "2 2\n1 0\n0 1",
                output: "2",
                isHidden: false,
            },
            // Hidden test cases (7)
            {
                input: "5 5\n1 0 0 0 1\n0 0 1 0 0\n0 1 0 0 0\n0 0 0 1 0\n1 0 0 0 1",
                output: "7",
                isHidden: true,
            },
            {
                input: "3 4\n1 0 1 0\n0 1 1 0\n1 0 0 1",
                output: "4",
                isHidden: true,
            },
            {
                input: "5 6\n1 0 0 1 1 0\n0 1 0 0 0 1\n1 0 1 0 1 0\n0 1 1 0 0 1\n1 1 1 0 1 0",
                output: "9",
                isHidden: true,
            },
            {
                input: "4 4\n1 0 0 1\n1 1 0 1\n0 1 1 0\n1 0 0 1",
                output: "4",
                isHidden: true,
            },
            {
                input: "5 7\n1 0 1 0 1 0 0\n0 1 0 1 1 0 1\n1 0 1 0 1 0 0\n0 1 1 1 0 0 1\n1 1 1 0 1 0 0",
                output: "9",
                isHidden: true,
            },
            {
                input: "1 3\n0 0 1",
                output: "1",
                isHidden: true,
            },
            {
                input: "3 3\n0 0 0\n0 0 0\n0 0 0",
                output: "0",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
m, n = map(int, input().split())
grid = []
for _ in range(m):
    row = list(map(int, input().split()))
    grid.append(row)

# TODO: Implement DFS/BFS to count islands
# Return number of connected components of 1's`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int m = sc.nextInt();
        int n = sc.nextInt();
        int[][] grid = new int[m][n];
        for (int i = 0; i < m; i++) {
            for (int j = 0; j < n; j++) {
                grid[i][j] = sc.nextInt();
            }
        }
        
        // TODO: Implement DFS/BFS to count islands
        // Return number of connected components of 1's
        
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
    int m, n;
    cin >> m >> n;
    
    vector<vector<int>> grid(m, vector<int>(n));
    for (int i = 0; i < m; i++) {
        for (int j = 0; j < n; j++) {
            cin >> grid[i][j];
        }
    }
    
    // TODO: Implement DFS/BFS to count islands
    // Return number of connected components of 1's
    
    return 0;
}`,
            },
        ],
    });

    // Problem 2: House Robber (Medium)
    await createOrUpdateProblem({
        title: "House Robber",
        slug: "house-robber",
        description: `You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. 

The only constraint stopping you from robbing each of them is that adjacent houses have security systems connected and it will automatically alert the police if two adjacent houses were broken into on the same night.

Given an integer array nums representing the amount of money of each house, return the maximum amount of money you can rob tonight without alerting the police.

**Example 1:**
\`\`\`
Input: 
4
1 2 3 1
Output:
4
\`\`\`

**Example 2:**
\`\`\`
Input:
5
2 7 9 3 1
Output:
12
\`\`\`

**Input Format:**
- First line: n (number of houses, 1 ≤ n ≤ 10^4)
- Second line: n space-separated integers (0 ≤ nums[i] ≤ 400)

**Output Format:**
- Single integer: maximum amount that can be robbed

**Constraints:**
- 1 ≤ n ≤ 10^4
- 0 ≤ nums[i] ≤ 400`,
        difficulty: Difficulty.MEDIUM,
        tags: ["dp", "array"],
        timeLimit: 2000,
        memoryLimit: 128,
        testCases: [
            // Visible test cases (4)
            {
                input: "4\n1 2 3 1",
                output: "4",
                isHidden: false,
            },
            {
                input: "5\n2 7 9 3 1",
                output: "12",
                isHidden: false,
            },
            {
                input: "1\n5",
                output: "5",
                isHidden: false,
            },
            {
                input: "2\n1 2",
                output: "2",
                isHidden: false,
            },
            // Hidden test cases (7)
            {
                input: "7\n6 7 1 3 8 2 4",
                output: "19",
                isHidden: true,
            },
            {
                input: "8\n1 3 4 5 2 6 7 8",
                output: "22",
                isHidden: true,
            },
            {
                input: "3\n0 0 5",
                output: "5",
                isHidden: true,
            },
            {
                input: "6\n10 1 2 3 4 5",
                output: "18",
                isHidden: true,
            },
            {
                input: "4\n1 1 1 1",
                output: "2",
                isHidden: true,
            },
            {
                input: "9\n2 2 2 2 2 2 2 2 2",
                output: "10",
                isHidden: true,
            },
            {
                input: "3\n5 1 5",
                output: "10",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
n = int(input())
nums = list(map(int, input().split()))

# TODO: Implement DP solution
# Rob houses to maximize money without robbing adjacent houses
# Return the maximum amount`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        // TODO: Implement DP solution
        // Rob houses to maximize money without robbing adjacent houses
        // Return the maximum amount
        
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
    
    // TODO: Implement DP solution
    // Rob houses to maximize money without robbing adjacent houses
    // Return the maximum amount
    
    return 0;
}`,
            },
        ],
    });

    // Problem 3: Coin Change (Medium)
    await createOrUpdateProblem({
        title: "Coin Change",
        slug: "coin-change",
        description: `You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return -1.

**Example 1:**
\`\`\`
Input: 
3
1 2 5
11
Output:
3
\`\`\`

**Example 2:**
\`\`\`
Input:
1
2
3
Output:
-1
\`\`\`

**Input Format:**
- First line: n (number of coin types, 1 ≤ n ≤ 100)
- Second line: n space-separated integers (1 ≤ coins[i] ≤ 10^4)
- Third line: amount (0 ≤ amount ≤ 10^4)

**Output Format:**
- Single integer: minimum number of coins, or -1 if impossible

**Constraints:**
- 1 ≤ n ≤ 100
- 1 ≤ coins[i] ≤ 10^4
- 0 ≤ amount ≤ 10^4
- Each coin can be used unlimited times`,
        difficulty: Difficulty.MEDIUM,
        tags: ["dp", "array", "breadth-first-search"],
        timeLimit: 3000,
        memoryLimit: 256,
        testCases: [
            // Visible test cases (4)
            {
                input: "3\n1 2 5\n11",
                output: "3",
                isHidden: false,
            },
            {
                input: "1\n2\n3",
                output: "-1",
                isHidden: false,
            },
            {
                input: "2\n1 1\n0",
                output: "0",
                isHidden: false,
            },
            {
                input: "4\n1 3 4 5\n7",
                output: "2",
                isHidden: false,
            },
            // Hidden test cases (7)
            {
                input: "3\n2 1 2\n3",
                output: "2",
                isHidden: true,
            },
            {
                input: "4\n1 2 5 1\n11",
                output: "3",
                isHidden: true,
            },
            {
                input: "5\n1 2 5 10 1\n0",
                output: "0",
                isHidden: true,
            },
            {
                input: "2\n5 10\n20",
                output: "2",
                isHidden: true,
            },
            {
                input: "3\n3 7 11\n30",
                output: "6",
                isHidden: true,
            },
            {
                input: "6\n1 5 10 25 50 3\n100",
                output: "2",
                isHidden: true,
            },
            {
                input: "3\n2 5 10\n1",
                output: "-1",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
n = int(input())
coins = list(map(int, input().split()))
amount = int(input())

# TODO: Implement DP to find minimum number of coins
# Each coin can be used unlimited times
# Return the minimum number of coins or -1 if impossible`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] coins = new int[n];
        for (int i = 0; i < n; i++) {
            coins[i] = sc.nextInt();
        }
        int amount = sc.nextInt();
        
        // TODO: Implement DP to find minimum number of coins
        // Each coin can be used unlimited times
        // Return the minimum number of coins or -1 if impossible
        
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
    
    vector<int> coins(n);
    for (int i = 0; i < n; i++) {
        cin >> coins[i];
    }
    
    int amount;
    cin >> amount;
    
    // TODO: Implement DP to find minimum number of coins
    // Each coin can be used unlimited times
    // Return the minimum number of coins or -1 if impossible
    
    return 0;
}`,
            },
        ],
    });

    // Problem 4: Total Hamming Distance (Medium)
    await createOrUpdateProblem({
        title: "Total Hamming Distance",
        slug: "total-hamming-distance",
        description: `The Hamming distance between two integers is the number of positions at which the corresponding bits are different.

Given an integer array nums, return the sum of Hamming distances between all pairs of the integers in nums.

**Example 1:**
\`\`\`
Input: 
3
4 14 2
Output:
6
\`\`\`

**Example 2:**
\`\`\`
Input:
3
4 14 4
Output:
4
\`\`\`

**Input Format:**
- First line: n (size of array, 2 ≤ n ≤ 10^4)
- Second line: n space-separated integers (0 ≤ nums[i] ≤ 10^9)

**Output Format:**
- Single integer: total Hamming distance for all pairs

**Constraints:**
- 2 ≤ n ≤ 10^4
- 0 ≤ nums[i] ≤ 10^9

**Explanation:**
The Hamming distance between two integers is the count of bits that differ. 
For each pair (i, j), calculate the Hamming distance(nums[i], nums[j]) and sum them all.`,
        difficulty: Difficulty.MEDIUM,
        tags: ["bit-manipulation", "array"],
        timeLimit: 3000,
        memoryLimit: 256,
        testCases: [
            // Visible test cases (4)
            {
                input: "3\n4 14 2",
                output: "6",
                isHidden: false,
            },
            {
                input: "3\n4 14 4",
                output: "4",
                isHidden: false,
            },
            {
                input: "2\n1 2",
                output: "2",
                isHidden: false,
            },
            {
                input: "5\n0 1 2 3 4",
                output: "16",
                isHidden: false,
            },
            // Hidden test cases (7)
            {
                input: "5\n1 3 5 7 9",
                output: "16",
                isHidden: true,
            },
            {
                input: "5\n1 1 1 1 1",
                output: "0",
                isHidden: true,
            },
            {
                input: "3\n7 8 15",
                output: "8",
                isHidden: true,
            },
            {
                input: "4\n8 15 16 23",
                output: "20",
                isHidden: true,
            },
            {
                input: "8\n0 1 2 3 4 5 6 7",
                output: "48",
                isHidden: true,
            },
            {
                input: "6\n31 63 127 255 1 2",
                output: "56",
                isHidden: true,
            },
            {
                input: "4\n0 0 0 0",
                output: "0",
                isHidden: true,
            },
        ],
        starterCode: [
            {
                language: Language.PYTHON,
                code: `# Read input
n = int(input())
nums = list(map(int, input().split()))

# TODO: Calculate total Hamming distance
# Hamming distance is the count of differing bits between numbers
# Sum distances for all pairs (i, j) where i < j`,
            },
            {
                language: Language.JAVA,
                code: `import java.util.Scanner;

public class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        
        int n = sc.nextInt();
        int[] nums = new int[n];
        for (int i = 0; i < n; i++) {
            nums[i] = sc.nextInt();
        }
        
        // TODO: Calculate total Hamming distance
        // Hamming distance is the count of differing bits between numbers
        // Sum distances for all pairs (i, j) where i < j
        
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
    
    // TODO: Calculate total Hamming distance
    // Hamming distance is the count of differing bits between numbers
    // Sum distances for all pairs (i, j) where i < j
    
    return 0;
}`,
            },
        ],
    });

    console.log("✅ Successfully seeded/updated 4 LeetCode-style problems:");
    console.log(
        "   - Number of Islands (MEDIUM) - 11 test cases (4 visible, 7 hidden)"
    );
    console.log(
        "   - House Robber (MEDIUM) - 11 test cases (4 visible, 7 hidden)"
    );
    console.log(
        "   - Coin Change (MEDIUM) - 11 test cases (4 visible, 7 hidden)"
    );
    console.log(
        "   - Total Hamming Distance (MEDIUM) - 11 test cases (4 visible, 7 hidden)"
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
    runLeetCodeSeed();
}

export { runLeetCodeSeed };

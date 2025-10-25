export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    tags: string[];
    featured: boolean;
    readTime: string;
    content: string;
}

// Static blog data for now - this will be replaced with file-based approach later
const BLOG_POSTS: BlogPost[] = [
    {
        slug: "sliding-window-technique",
        title: "Mastering the Sliding Window Technique",
        excerpt:
            "Learn the powerful sliding window algorithm pattern with examples, templates, and practice problems for competitive programming.",
        author: "CodeMonster Team",
        date: "2024-01-15",
        tags: ["sliding-window", "algorithms", "arrays", "optimization"],
        featured: true,
        readTime: "10 min",
        content: `# Mastering the Sliding Window Technique

The sliding window technique is one of the most powerful algorithmic patterns in competitive programming. It's elegant, efficient, and can solve many array-based problems that would otherwise require nested loops.

## What is Sliding Window?

A sliding window is an abstract concept that represents a contiguous subarray of a given array. Instead of recalculating everything for each subarray, we "slide" the window across the array, updating the result incrementally.

## When to Use Sliding Window?

Look for these patterns in problem statements:

1. **Contiguous Subarray/Substring**: "Find subarray with..."
2. **Fixed Size**: "Find subarray of size k..."
3. **Constrained Properties**: "Maximum sum subarray with..."
4. **Optimization**: "Minimum/Maximum subarray satisfying..."

## Core Patterns

### 1. Fixed Size Sliding Window

#### Problem: Maximum Sum of Subarray of Size K
\`\`\`python
def max_subarray_sum_k(arr, k):
    if k > len(arr):
        return 0

    window_sum = sum(arr[:k])
    max_sum = window_sum

    for i in range(k, len(arr)):
        window_sum += arr[i] - arr[i-k]
        max_sum = max(max_sum, window_sum)

    return max_sum
\`\`\`

#### Problem: Count Negative Numbers in a K-Sized Window
\`\`\`python
def count_negatives_in_window(arr, k):
    result = []
    neg_count = 0

    # Initialize first window
    for i in range(k):
        if arr[i] < 0:
            neg_count += 1

    result.append(neg_count)

    # Slide the window
    for i in range(k, len(arr)):
        if arr[i] < 0:
            neg_count += 1
        if arr[i-k] < 0:
            neg_count -= 1
        result.append(neg_count)

    return result
\`\`\`

### 2. Variable Size Sliding Window

#### Problem: Longest Substring with K Distinct Characters
\`\`\`python
def longest_substring_k_distinct(s, k):
    char_count = {}
    max_len = 0
    left = 0

    for right in range(len(s)):
        char_count[s[right]] = char_count.get(s[right], 0) + 1

        while len(char_count) > k:
            char_count[s[left]] -= 1
            if char_count[s[left]] == 0:
                del char_count[s[left]]
            left += 1

        max_len = max(max_len, right - left + 1)

    return max_len
\`\`\`

#### Problem: Longest Subarray with Sum ≤ K
\`\`\`python
def longest_subarray_sum_le_k(arr, k):
    min_prefix_sum = [float('inf')] * (len(arr) + 1)
    min_prefix_sum[0] = 0

    for i in range(1, len(arr) + 1):
        min_prefix_sum[i] = min(min_prefix_sum[i-1],
                               min_prefix_sum[i-1] + arr[i-1])

    max_len = 0
    current_sum = 0
    left = 0

    for right in range(len(arr)):
        current_sum += arr[right]

        while current_sum > k:
            current_sum -= arr[left]
            left += 1

        max_len = max(max_len, right - left + 1)

    return max_len
\`\`\`

### 3. Advanced Sliding Window Techniques

#### Two Pointers for Opposite Directions
\`\`\`python
def trap_rain_water(height):
    left, right = 0, len(height) - 1
    left_max, right_max = 0, 0
    water = 0

    while left < right:
        if height[left] < height[right]:
            if height[left] >= left_max:
                left_max = height[left]
            else:
                water += left_max - height[left]
            left += 1
        else:
            if height[right] >= right_max:
                right_max = height[right]
            else:
                water += right_max - height[right]
            right -= 1

    return water
\`\`\`

## Common Template

\`\`\`python
def sliding_window_template(arr, k=None, condition=None):
    """
    Generic sliding window template
    arr: input array
    k: window size (for fixed size windows)
    condition: function to check window validity (for variable size)
    """
    n = len(arr)
    result = []

    # Initialize window
    window_data = {}
    left = 0

    for right in range(n):
        # Add current element to window
        add_to_window(arr[right], window_data)

        # Remove from left while window is invalid
        while (k and right - left + 1 > k) or \
              (condition and not condition(window_data)):
            remove_from_window(arr[left], window_data)
            left += 1

        # Record result
        record_result(window_data, result)

    return result
\`\`\`

## Practice Problems

### Beginner
1. **Maximum Sum Subarray**: Find maximum sum of subarray of size k
2. **First Negative**: Find first negative number in every window
3. **Maximum Average**: Find maximum average of any subarray of length k

### Intermediate
1. **Longest Substring**: With K distinct characters
2. **Smallest Subarray**: With sum greater than x
3. **Fruit Into Baskets**: Maximum fruits in two baskets

### Advanced
1. **Longest Valid Parentheses**: Find longest valid parentheses substring
2. **Count Subarrays**: With exactly K distinct elements
3. **Minimize Deviation**: Using sliding window with heaps

## Key Insights

1. **Maintain State**: Only update what changes when sliding
2. **Two Pointers**: Often implemented with left and right pointers
3. **Linear Time**: Most sliding window solutions are O(n)
4. **Space Optimization**: Usually O(1) or O(k) extra space

Remember: Practice is key! Start with fixed-size windows and gradually move to variable-size problems. The sliding window technique will become second nature with enough practice!

Happy coding! 🚀`,
    },
    {
        slug: "bit-manipulation-techniques",
        title: "Complete Guide to Bit Manipulation Techniques",
        excerpt:
            "Master bit manipulation tricks and techniques for competitive programming with comprehensive examples and use cases.",
        author: "CodeMonster Team",
        date: "2024-01-18",
        tags: ["bit-manipulation", "algorithms", "optimization", "binary"],
        featured: true,
        readTime: "12 min",
        content: `# Complete Guide to Bit Manipulation Techniques

Bit manipulation is a powerful technique in competitive programming that can lead to elegant and highly optimized solutions. Understanding bits is essential for many algorithms and can often reduce time complexity significantly.

## Introduction to Binary

### Number Systems
- **Decimal**: Base-10 (0-9)
- **Binary**: Base-2 (0-1)
- **Hexadecimal**: Base-16 (0-F)

### Binary Representation
\`\`\`
Decimal: 42
Binary:  101010
          ^   ^  ^
          ^   ^  ^
         32   8  2  = 42
\`\`\`

## Fundamental Bit Operations

### 1. Bitwise AND (&)
- Returns 1 only if both bits are 1
- Useful for checking if a specific bit is set

\`\`\`python
def check_bit(num, position):
    mask = 1 << position
    return (num & mask) != 0

# Example: Check if 3rd bit is set in number 10 (1010)
num = 10  # 1010 in binary
result = num & (1 << 3)  # 1010 & 1000 = 1000 (8)
\`\`\`

### 2. Bitwise OR (|)
- Returns 1 if either bit is 1
- Useful for setting specific bits

\`\`\`python
def set_bit(num, position):
    return num | (1 << position)

# Example: Set 2nd bit in number 5 (0101)
num = 5
result = num | (1 << 2)  # 0101 | 0100 = 0101 (9)
\`\`\`

### 3. Bitwise XOR (^)
- Returns 1 if bits are different
- Useful for toggling bits and finding unique elements

\`\`\`python
def toggle_bit(num, position):
    return num ^ (1 << position)

def find_unique(arr):
    # XOR all elements to find the unique one
    result = 0
    for num in arr:
        result ^= num
    return result

# Example: Find unique element [2, 4, 7, 2, 4]
# Result = 7 because 2^4^7^2^4 = (2^2)^(4^4)^7 = 0^0^7 = 7
\`\`\`

### 4. Bitwise NOT (~)
- Flips all bits
- Two's complement: ~n = -n-1

\`\`\`python
def flip_bits(num):
    return ~num

# Important: In two's complement
# ~5 = -6
# ~-1 = 0
\`\`\`

## Essential Bit Tricks

### 1. Get Least Significant Bit (LSB)
\`\`\`python
def get_lsb(num):
    return num & -num  # or: num & ~(num - 1)

# Examples:
# get_lsb(12) = 12 & -12 = 1100 & 0100 = 0100 (4)
# get_lsb(10) = 10 & -10 = 1010 & 0110 = 0010 (2)
\`\`\`

### 2. Remove LSB
\`\`\`python
def remove_lsb(num):
    return num & (num - 1)

# Example:
# remove_lsb(12) = 12 & 11 = 1100 & 1011 = 1000 (8)
# remove_lsb(10) = 10 & 9 = 1010 & 1001 = 1000 (8)
\`\`\`

### 3. Check if Number is Power of 2
\`\`\`python
def is_power_of_two(n):
    return n > 0 and (n & (n - 1)) == 0

# Works because powers of 2 have only one bit set
# 8: 1000, 8-1: 0111, 1000 & 0111 = 0000 ✓
# 10: 1010, 10-1: 1001, 1010 & 1001 = 1000 ✗
\`\`\`

### 4. Count Set Bits (Population Count)
\`\`\`python
# Method 1: Built-in
def count_set_bits(n):
    return bin(n).count('1')

# Method 2: Brian Kernighan's Algorithm
def count_set_bits_optimized(n):
    count = 0
    while n:
        n &= n - 1  # Remove LSB
        count += 1
    return count

# Method 3: Lookup table (for speed)
def count_set_bits_fast(n):
    count = 0
    while n:
        count += bits_set[n & 0xFF]  # Lookup first 8 bits
        n >>= 8
    return count
\`\`\`

### 5. Generate All Subsets
\`\`\`python
def all_subsets(arr):
    n = len(arr)
    subsets = []

    for mask in range(1 << n):  # 2^n subsets
        subset = []
        for i in range(n):
            if mask & (1 << i):
                subset.append(arr[i])
        subsets.append(subset)

    return subsets

# Example: arr = [1, 2, 3]
# masks: 000, 001, 010, 011, 100, 101, 110, 111
# subsets: [], [3], [2], [2,3], [1], [1,3], [1,2], [1,2,3]
\`\`\`

## Common Bit Manipulation Problems

### 1. Swap Two Numbers Without Temporary
\`\`\`python
def swap_without_temp(a, b):
    a = a ^ b
    b = a ^ b  # b = (a ^ b) ^ b = a
    a = a ^ b  # a = (a ^ b) ^ a = b
    return a, b

# a, b = swap_without_temp(5, 3)  # Returns (3, 5)
\`\`\`

### 2. Find Single Number in Array
\`\`\`python
def single_number(nums):
    result = 0
    for num in nums:
        result ^= num
    return result

# nums = [2,2,1] -> result = 1
# nums = [4,1,2,1,2] -> result = 4
\`\`\`

### 3. Reverse Bits of a Number
\`\`\`python
def reverse_bits(n):
    result = 0
    for i in range(32):
        result <<= 1
        result |= (n & 1)
        n >>= 1
    return result
\`\`\`

### 4. Find Missing Number
\`\`\`python
def find_missing(nums):
    n = len(nums) + 1
    expected = n * (n + 1) // 2

    # Using XOR
    xor_all = 0
    for i in range(1, n + 1):
        xor_all ^= i

    xor_nums = 0
    for num in nums:
        xor_nums ^= num

    return xor_all ^ xor_nums
\`\`\`

## Advanced Bit Techniques

### 1. Gray Code
\`\`\`python
def gray_code(n):
    result = []
    for i in range(1 << n):
        result.append(i ^ (i >> 1))
    return result

# n=2: [0, 1, 3, 2] -> [00, 01, 11, 10]
\`\`\`

### 2. Next Higher Number with Same Bits
\`\`\`python
def next_higher_same_bits(n):
    c = n
    c0 = c1 = 0

    # Count trailing zeros
    while c & 1 == 0 and c != 0:
        c0 += 1
        c >>= 1

    # Count ones after trailing zeros
    while c & 1 == 1:
        c1 += 1
        c >>= 1

    # If n is like 11...1100...00, then no bigger number
    if c0 + c1 == 31 or c0 + c1 == 0:
        return -1

    # Position of rightmost non-trailing zero
    p = c0 + c1

    n |= (1 << p)  # Flip rightmost non-trailing zero
    n &= ~((1 << p) - 1)  # Clear all bits to the right of p
    n |= (1 << (c1 - 1)) - 1  # Insert (c1-1) ones on the right

    return n
\`\`\`

### 3. Bitmask DP
\`\`\`python
def subset_sum_bitmask(nums):
    n = len(nums)
    dp = [0] * (1 << n)

    for mask in range(1 << n):
        for i in range(n):
            if mask & (1 << i):
                dp[mask] += nums[i]

    return dp
\`\`\`

## Practical Applications

### 1. Permission Systems
\`\`\`python
# Define permissions
READ = 1 << 0    # 1
WRITE = 1 << 1   # 2
EXECUTE = 1 << 2 # 4
DELETE = 1 << 3  # 8

def has_permission(user_perms, required_perm):
    return (user_perms & required_perm) == required_perm

def grant_permission(user_perms, new_perm):
    return user_perms | new_perm

def revoke_permission(user_perms, remove_perm):
    return user_perms & ~remove_perm
\`\`\`

### 2. Graph State Representation
\`\`\`python
# Represent visited states in graph problems
def shortest_path_bitmask(graph):
    n = len(graph)
    dp = [[float('inf')] * (1 << n) for _ in range(n)]

    # Start from vertex 0
    dp[0][1] = 0

    for mask in range(1, 1 << n):
        for u in range(n):
            if not (mask & (1 << u)):
                continue

            for v in range(n):
                if mask & (1 << v):
                    continue

                new_mask = mask | (1 << v)
                dp[v][new_mask] = min(dp[v][new_mask],
                                      dp[u][mask] + graph[u][v])

    return min(dp[i][(1 << n) - 1] for i in range(n))
\`\`\`

## Performance Considerations

### When to Use Bit Manipulation:
1. **Time-critical operations**: O(1) bit ops vs O(log n) arithmetic
2. **Space optimization**: Represent sets compactly
3. **Parallel operations**: Process multiple bits simultaneously
4. **State encoding**: Compact representation of combinations

### When to Avoid:
1. **Readability matters**: Complex bit operations can be confusing
2. **Large datasets**: Bit operations on very large numbers
3. **Floating point**: Not applicable to non-integer types

## Key Takeaways

1. **Understand Binary**: Master binary representation first
2. **Practice Patterns**: Learn common bit manipulation patterns
3. **Use XOR Wisely**: Powerful for finding unique elements
4. **Mask Operations**: Key to selective bit manipulation
5. **Two's Complement**: Essential for negative number handling

Bit manipulation is a skill that improves with practice. Start with simple problems and gradually tackle more complex ones. The key is to think in binary!

Happy coding! 💻✨`,
    },
    {
        slug: "mastering-dynamic-programming",
        title: "Mastering Dynamic Programming: A Complete Guide",
        excerpt:
            "Deep dive into dynamic programming techniques, patterns, and problem-solving strategies for competitive programming.",
        author: "CodeMonster Team",
        date: "2024-01-20",
        tags: ["dynamic-programming", "algorithms", "optimization", "advanced"],
        featured: true,
        readTime: "12 min",
        content: `# Mastering Dynamic Programming: A Complete Guide

Dynamic Programming (DP) is one of the most powerful problem-solving techniques in computer science. While it can seem intimidating at first, understanding DP patterns will dramatically improve your problem-solving abilities.

## What Makes a Problem Suitable for DP?

A problem can be solved using dynamic programming if it has these properties:

### 1. Optimal Substructure
The optimal solution to the problem can be constructed from optimal solutions to its subproblems.

### 2. Overlapping Subproblems
The same subproblems are solved multiple times, leading to redundancy.

## Core DP Concepts

### Bottom-Up vs Top-Down Approaches

#### Bottom-Up (Tabulation)
\`\`\`python
def fibonacci_bottom_up(n):
    if n <= 1:
        return n

    dp = [0] * (n + 1)
    dp[0] = 0
    dp[1] = 1

    for i in range(2, n + 1):
        dp[i] = dp[i-1] + dp[i-2]

    return dp[n]
\`\`\`

#### Top-Down (Memoization)
\`\`\`python
def fibonacci_top_down(n, memo={}):
    if n in memo:
        return memo[n]
    if n <= 1:
        return n

    memo[n] = fibonacci_top_down(n-1, memo) + fibonacci_top_down(n-2, memo)
    return memo[n]
\`\`\`

## Common DP Patterns

### 1. Linear DP
Problems that can be solved by iterating through the input linearly.

#### Example: Longest Increasing Subsequence
\`\`\`python
def length_of_lis(nums):
    if not nums:
        return 0

    dp = [1] * len(nums)

    for i in range(1, len(nums)):
        for j in range(i):
            if nums[i] > nums[j]:
                dp[i] = max(dp[i], dp[j] + 1)

    return max(dp)
\`\`\`

### 2. Knapsack Problems
A classic DP pattern involving optimization with constraints.

#### 0/1 Knapsack
\`\`\`python
def knapsack_01(weights, values, capacity):
    n = len(weights)
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]

    for i in range(1, n + 1):
        for w in range(capacity + 1):
            if weights[i-1] <= w:
                dp[i][w] = max(values[i-1] + dp[i-1][w-weights[i-1]],
                              dp[i-1][w])
            else:
                dp[i][w] = dp[i-1][w]

    return dp[n][capacity]
\`\`\`

## Problem-Solving Strategy

### Step 1: Identify DP Characteristics
Ask yourself:
- Can I break this problem into smaller subproblems?
- Are there overlapping subproblems?
- Does the optimal solution depend on optimal sub-solutions?

### Step 2: Define the State
What information do you need to represent a subproblem?

### Step 3: Formulate the Recurrence
How can you express the solution to a problem in terms of its subproblems?

### Step 4: Determine Base Cases
What are the simplest subproblems you can solve directly?

### Step 5: Choose Implementation Style
- Memoization (top-down) for easier implementation
- Tabulation (bottom-up) for better performance

## Practice Problems to Master DP

### Beginner Level
- Fibonacci numbers
- Factorial with memoization
- Simple coin change problems
- Staircase problems

### Intermediate Level
- Longest Common Subsequence
- Edit Distance
- 0/1 Knapsack
- Matrix Chain Multiplication

### Advanced Level
- Traveling Salesman Problem
- Complex string matching
- Multi-dimensional optimization
- Probabilistic DP problems

Dynamic programming is a skill that improves with practice. Start with simple problems and gradually work your way up to more complex ones. The key is to recognize DP patterns and apply them systematically.

Happy problem-solving! 💻🎯`,
    },
    {
        slug: "code-monster-guide",
        title: "Complete Guide to CodeMonster Platform",
        excerpt:
            "Everything you need to know about CodeMonster - from getting started to mastering competitive programming on our platform.",
        author: "CodeMonster Team",
        date: "2024-01-25",
        tags: ["code-monster", "platform-guide", "tutorial", "getting-started"],
        featured: false,
        readTime: "10 min",
        content: `# Complete Guide to CodeMonster Platform

Welcome to CodeMonster, your ultimate competitive programming playground! This comprehensive guide will help you navigate our platform and make the most of your coding journey.

## What is CodeMonster?

CodeMonster is a modern competitive programming platform that combines the excitement of coding battles with structured learning. Built with a microservices architecture, we offer:

- **Real-time 1v1 Coding Battles**: Challenge other programmers in live coding matches
- **Comprehensive Problem Library**: Practice with thousands of algorithmic problems
- **Interactive Learning Path**: Progress from beginner to advanced concepts
- **Leaderboards and Rankings**: Compete with programmers worldwide
- **Integrated Development Environment**: Code directly in your browser with powerful tools

## Getting Started

### Step 1: Create Your Account

1. Visit [codemonster.in](https://codemonster.in)
2. Click "Sign Up" and choose your preferred method:
   - Email and password
   - Google account
   - GitHub account
3. Complete your profile with your programming background

### Step 2: Set Up Your Profile

Your profile is your competitive programming identity. Make sure to:

- **Add your programming languages**: Let others know what languages you're comfortable with
- **Set your bio**: Share your coding journey and goals
- **Choose a profile picture**: Stand out in leaderboards and battles
- **Connect your coding profiles**: Link your Codeforces, LeetCode, or GitHub profiles

## Platform Features

### 1. Problem Solving

#### Browse Problems
- **Difficulty Levels**: Easy, Medium, Hard, and Expert
- **Categories**: Arrays, Strings, Dynamic Programming, Graphs, Math, and more
- **Tags**: Filter problems by specific algorithms and data structures
- **Contest Problems**: Practice with actual contest questions

### 2. Real-time Battles

#### How Battles Work
1. **Matchmaking**: Based on your rating and preferences
2. **Problem Selection**: Random problem appropriate for your skill level
3. **Time Limit**: Usually 60-90 minutes per battle
4. **Scoring**: Points based on solution correctness, efficiency, and time

### 3. Learning Paths

#### Structured Curriculum
Our learning paths guide you from fundamentals to mastery:

**Beginner Track**
- Basic input/output
- Variables and data types
- Control structures
- Functions and recursion
- Arrays and strings

**Intermediate Track**
- Object-oriented programming
- Data structures (stacks, queues, trees)
- Sorting and searching algorithms
- Basic graph algorithms
- Dynamic programming introduction

**Advanced Track**
- Complex graph algorithms
- Advanced dynamic programming
- Number theory and combinatorics
- String algorithms
- Computational geometry

## Tips for Success

### 1. Effective Practice Strategy

#### Consistency Over Intensity
\`\`\`python
# Better: 30 minutes daily
def daily_practice():
    solve_problems(3)
    review_concepts()
    analyze_mistakes()

# Less effective: 5 hours once a week
\`\`\`

#### Deliberate Practice
- **Focus on weak areas**: Identify and improve your struggling topics
- **Analyze solutions**: Study optimal approaches even for problems you solve
- **Learn from failures**: Review why your solutions don't work
- **Teach others**: Explaining concepts solidifies understanding

### 2. Problem-Solving Approach

#### The 5-Step Method
1. **Understand the problem**: Read carefully, identify constraints
2. **Plan your approach**: Choose algorithms and data structures
3. **Implement solution**: Write clean, readable code
4. **Test thoroughly**: Use edge cases and sample inputs
5. **Optimize if needed**: Improve time/space complexity

Ready to start your journey? Log in to CodeMonster and begin solving problems today!

Happy coding, and may your solutions always pass all test cases! 🚀`,
    },
];

// Get all blog posts with metadata
export function getAllBlogPosts(): BlogPost[] {
    return BLOG_POSTS.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

// Get a single blog post by slug
export function getBlogPost(slug: string): BlogPost | null {
    return BLOG_POSTS.find((post) => post.slug === slug) || null;
}

// Get featured blog posts
export function getFeaturedBlogPosts(): BlogPost[] {
    return BLOG_POSTS.filter((post) => post.featured);
}

// Get recent blog posts (excluding current slug if provided)
export function getRecentBlogPosts(
    limit: number = 5,
    excludeSlug?: string
): BlogPost[] {
    return BLOG_POSTS.filter((post) => post.slug !== excludeSlug).slice(
        0,
        limit
    );
}

// Get all unique tags
export function getAllTags(): string[] {
    const allTags = BLOG_POSTS.flatMap((post) => post.tags);
    return [...new Set(allTags)].sort();
}

// Get posts by tag
export function getBlogPostsByTag(tag: string): BlogPost[] {
    return BLOG_POSTS.filter((post) =>
        post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
    );
}

// Search blog posts
export function searchBlogPosts(query: string): BlogPost[] {
    const lowercaseQuery = query.toLowerCase();

    return BLOG_POSTS.filter(
        (post) =>
            post.title.toLowerCase().includes(lowercaseQuery) ||
            post.excerpt.toLowerCase().includes(lowercaseQuery) ||
            post.content.toLowerCase().includes(lowercaseQuery) ||
            post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
}

// Get related posts based on tags and similarity
export function getRelatedBlogPosts(
    currentPost: BlogPost,
    limit: number = 3
): BlogPost[] {
    const otherPosts = BLOG_POSTS.filter(
        (post) => post.slug !== currentPost.slug
    );

    // Score posts based on shared tags and similarity
    const scoredPosts = otherPosts.map((post) => {
        let score = 0;

        // Boost score for shared tags
        const sharedTags = post.tags.filter((tag) =>
            currentPost.tags.includes(tag)
        );
        score += sharedTags.length * 10;

        // Boost score for same category (first tag)
        if (post.tags[0] === currentPost.tags[0]) {
            score += 5;
        }

        // Small boost for same author
        if (post.author === currentPost.author) {
            score += 2;
        }

        return { post, score };
    });

    // Sort by score and return top posts
    return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.post);
}

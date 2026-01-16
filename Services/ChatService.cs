using System.Text;
using System.Collections.Generic;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class ChatService
    {
        private class AlgoInfo
        {
            public string Title { get; set; }
            public string Description { get; set; }
            public string Time { get; set; }
            public string Space { get; set; }
            public string Logic { get; set; }
            public string RealWorld { get; set; }
            public string AppGuide { get; set; }
        }

        private readonly Dictionary<string, AlgoInfo> _knowledgeBase;

        public ChatService()
        {
            _knowledgeBase = new Dictionary<string, AlgoInfo>();
            InitializeKnowledgeBase();
        }

        public string GetResponse(string message, string currentPage)
        {
            var msg = message.ToLower().Trim();

            // 1. Detect Intent
            bool isUsageQuestion = msg.Contains("how to use") || msg.Contains("how do i") || msg.Contains("how to play") || msg.Contains("guide") || msg.Contains("steps");
            
            // 2. Identify Subject
            string subjectKey = IdentifySubject(msg);

            // 3. Fallback to Context if subject not found in message
            if (string.IsNullOrEmpty(subjectKey) && !string.IsNullOrEmpty(currentPage))
            {
                subjectKey = IdentifySubject(currentPage.ToLower());
            }

            // 4. Generate Response
            if (!string.IsNullOrEmpty(subjectKey) && _knowledgeBase.ContainsKey(subjectKey))
            {
                var info = _knowledgeBase[subjectKey];
                if (isUsageQuestion)
                {
                    return FormatUsageResponse(info);
                }
                else
                {
                    return FormatConceptResponse(info);
                }
            }

            // 5. General Conversation (if no algorithm found)
            if (msg == "hi" || msg == "hello" || msg.StartsWith("hi ") || msg.StartsWith("hello "))
                return "👋 **Hello!** I can help you with algorithms. \n\nTry asking:\n• *\"What is BFS?\"* (for theory)\n• *\"How to use BFS?\"* (for app guide)";

            if (msg.Contains("help"))
                return "💡 **I can help in two ways:**\n\n1. **Theory**: Ask *\"What is [Algo]?\"* or *\"Real world uses of [Algo]\"*.\n2. **App Guide**: Ask *\"How to use [Algo]?\"* to see how to run the visualizer.";

            return "I'm not sure which algorithm you're asking about. Try mentioning a specific one like 'BFS', 'BST', or 'Quick Sort'.";
        }

        private string IdentifySubject(string text)
        {
            if (text.Contains("linear")) return "linear";
            if (text.Contains("binary search") && !text.Contains("tree")) return "binarysearch"; // Distinct from BST
            if (text.Contains("interpolation")) return "interpolation";
            if (text.Contains("bubble")) return "bubble";
            if (text.Contains("quick")) return "quick";
            if (text.Contains("merge")) return "merge";
            if (text.Contains("heap sort")) return "heapsort";
            if (text.Contains("radix")) return "radix";
            if (text.Contains("bfs") || text.Contains("breadth")) return "bfs";
            if (text.Contains("dfs") || text.Contains("depth")) return "dfs";
            if (text.Contains("dijkstra")) return "dijkstra";
            if (text.Contains("prim")) return "prim";
            if (text.Contains("kruskal")) return "kruskal";
            if (text.Contains("coloring") || text.Contains("graph color")) return "coloring";
            if (text.Contains("bst") || text.Contains("binary search tree")) return "bst";
            if (text.Contains("min heap") || (text.Contains("min") && text.Contains("heap"))) return "minheap";
            if (text.Contains("max heap") || (text.Contains("max") && text.Contains("heap"))) return "maxheap";
            if (text.Contains("huffman")) return "huffman";
            if (text.Contains("tsp") || text.Contains("salesman")) return "tsp";
            if (text.Contains("queen")) return "nqueens";
            if (text.Contains("knight")) return "knight";
            return "";
        }

        private string FormatConceptResponse(AlgoInfo info)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"### 📘 {info.Title}");
            sb.AppendLine("");
            sb.AppendLine($"**{info.Description}**");
            sb.AppendLine("");
            sb.AppendLine($"⏱️ **Time**: `{info.Time}`");
            sb.AppendLine($"💾 **Space**: `{info.Space}`");
            sb.AppendLine("");
            sb.AppendLine("**🌍 Real-world Uses:**");
            sb.AppendLine(info.RealWorld);
            sb.AppendLine("");
            sb.AppendLine("*(Tip: Ask \"How to use this?\" for a UI guide)*");
            return sb.ToString();
        }

        private string FormatUsageResponse(AlgoInfo info)
        {
            var sb = new StringBuilder();
            sb.AppendLine($"### 🎮 Guide: {info.Title}");
            sb.AppendLine("");
            sb.AppendLine("**Follow these steps to run the visualizer:**");
            sb.AppendLine("");
            sb.AppendLine(info.AppGuide);
            sb.AppendLine("");
            sb.AppendLine("*(Tip: Ask \"What is this?\" for theory & complexity)*");
            return sb.ToString();
        }

        private void InitializeKnowledgeBase()
        {
            _knowledgeBase["linear"] = new AlgoInfo {
                Title = "Linear Search",
                Description = "Iterates through a collection one by one until the target element is found.",
                Time = "O(N)", Space = "O(1)",
                RealWorld = "Finding a contact in an unsorted list, checking for duplicates in small datasets.",
                AppGuide = "1. Enter a number in the input box.\n2. Click 'Search'.\n3. The visualizer will highlight each box in blue as it checks them."
            };

            _knowledgeBase["binarysearch"] = new AlgoInfo {
                Title = "Binary Search",
                Description = "Efficiently finds an item in a sorted list by repeatedly dividing the search interval in half.",
                Time = "O(log N)", Space = "O(1)",
                RealWorld = "Dictionary lookups, database indexing (B-Trees), debugging (git bisect).",
                AppGuide = "1. Click 'Generate Sorted' (Required!).\n2. Enter a target number.\n3. Click 'Search'.\n4. Watch gray boxes disappear as the search space halves."
            };

            _knowledgeBase["interpolation"] = new AlgoInfo {
                Title = "Interpolation Search",
                Description = "Estimates the position of a target value based on its value relative to the range, like searching a phonebook.",
                Time = "O(log(log N))", Space = "O(1)",
                RealWorld = "Searching uniformly distributed data (e.g., timestamps in logs).",
                AppGuide = "1. Ensure array is Sorted.\n2. Enter target.\n3. Click 'Search' to see the probe jump directly near the target."
            };

            _knowledgeBase["bubble"] = new AlgoInfo {
                Title = "Bubble Sort",
                Description = "Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.",
                Time = "O(N²)", Space = "O(1)",
                RealWorld = "Educational demos, detecting if a list is already sorted (one pass).",
                AppGuide = "1. Click 'Generate Random'.\n2. Click 'Sort'.\n3. Adjust the **Speed Slider** to see the swapping clearly."
            };
            
            _knowledgeBase["quick"] = new AlgoInfo {
                Title = "Quick Sort",
                Description = "A divide-and-conquer algorithm that partitions an array around a pivot element.",
                Time = "O(N log N)", Space = "O(log N)",
                RealWorld = "Standard language libraries (C++, Java), high-performance systems.",
                AppGuide = "1. Generate an array.\n2. Click 'Sort'.\n3. Observe the **Pivot** (often colored differently) moving to its final place first."
            };

            _knowledgeBase["merge"] = new AlgoInfo {
                Title = "Merge Sort",
                Description = "Divides the array into halves, sorts them recursively, and merges them back together.",
                Time = "O(N log N)", Space = "O(N)",
                RealWorld = "Sorting linked lists, external sorting (databases/files too large for RAM).",
                AppGuide = "1. Click 'Sort'.\n2. Watch the array break down into single units.\n3. Watch them merge back together in sorted order."
            };

            _knowledgeBase["heapsort"] = new AlgoInfo {
                Title = "Heap Sort",
                Description = "Converts the array into a Max Heap, then repeatedly extracts the max element.",
                Time = "O(N log N)", Space = "O(1)",
                RealWorld = "Embedded systems (predictable memory usage), kernel sorting.",
                AppGuide = "1. Click 'Sort'.\n2. First phase: Array transforms into a Heap.\n3. Second phase: Max elements move to the end."
            };

            _knowledgeBase["radix"] = new AlgoInfo {
                Title = "Radix Sort",
                Description = "Sorts numbers digit by digit (LSD to MSD) without direct comparison.",
                Time = "O(NK)", Space = "O(N+K)",
                RealWorld = "Sorting integers, strings, dates, or card decks.",
                AppGuide = "1. Click 'Sort'.\n2. Colors represent 'buckets'.\n3. Watch items group by 1s digit, then 10s digit."
            };

            _knowledgeBase["bfs"] = new AlgoInfo {
                Title = "Breadth-First Search (BFS)",
                Description = "Explores a graph layer by layer, visiting neighbors before moving deeper.",
                Time = "O(V + E)", Space = "O(V)",
                RealWorld = "Shortest path in unweighted graphs, social network connections (degrees of separation).",
                AppGuide = "1. Click 'Random Graph'.\n2. Click a node to **Start**.\n3. Click 'Run BFS'.\n4. Watch the 'wave' expand outward."
            };

            _knowledgeBase["dfs"] = new AlgoInfo {
                Title = "Depth-First Search (DFS)",
                Description = "Explores as deep as possible along each branch before backtracking.",
                Time = "O(V + E)", Space = "O(V)",
                RealWorld = "Maze solving, topological sorting, finding connected components.",
                AppGuide = "1. Select a **Start Node**.\n2. Click 'Run DFS'.\n3. Watch the path dive deep into the graph before returning."
            };

            _knowledgeBase["dijkstra"] = new AlgoInfo {
                Title = "Dijkstra's Algorithm",
                Description = "Finds the shortest paths from a source to all other nodes in a weighted graph.",
                Time = "O(E + V log V)", Space = "O(V)",
                RealWorld = "Google Maps (routing), Network protocols (OSPF).",
                AppGuide = "1. **Double-click** a node to set Source.\n2. **Double-click** another for Target (optional).\n3. Click 'Find Shortest Path'."
            };

            _knowledgeBase["prim"] = new AlgoInfo {
                Title = "Prim's Algorithm",
                Description = "Greedy algorithm that builds a Minimum Spanning Tree from a starting node.",
                Time = "O(E log V)", Space = "O(V)",
                RealWorld = "Network design (fiber/cables), clustering data.",
                AppGuide = "1. Click 'Generate Graph'.\n2. Click 'Run Prim's'.\n3. Edges turn green as they join the main tree."
            };

            _knowledgeBase["kruskal"] = new AlgoInfo {
                Title = "Kruskal's Algorithm",
                Description = "Builds a Minimum Spanning Tree by adding the smallest edges that don't form a cycle.",
                Time = "O(E log E)", Space = "O(V)",
                RealWorld = "Electric grid layout, LAN wiring.",
                AppGuide = "1. Click 'Run Kruskal'.\n2. Watch it check the global smallest edge.\n3. See 'Union-Find' logic prevent cycles."
            };

            _knowledgeBase["coloring"] = new AlgoInfo {
                Title = "Graph Coloring",
                Description = "Assigns colors to vertices so no neighbors share a color.",
                Time = "NP-Complete (Greedy approx: O(V²))", Space = "O(V)",
                RealWorld = "Sudoku formulation, Register allocation in CPUs, Map coloring.",
                AppGuide = "1. Create a graph with many edges.\n2. Click 'Color Graph'.\n3. Observe the minimum number of colors used."
            };

            _knowledgeBase["bst"] = new AlgoInfo {
                Title = "Binary Search Tree (BST)",
                Description = "A tree where left child < parent < right child.",
                Time = "O(log N)", Space = "O(N)",
                RealWorld = "Databases (search indexes), TreeSet/TreeMap in languages.",
                AppGuide = "1. Click 'Auto' to watch the build.\n2. Or use **Arrow Buttons** (< >) to step through manually.\n3. See how numbers compare to find their slot."
            };

            _knowledgeBase["minheap"] = new AlgoInfo {
                Title = "Min Heap",
                Description = "Complete binary tree where parent <= children. Root is global minimum.",
                Time = "O(log N)", Space = "O(N)",
                RealWorld = "Priority Queues, Huffman Coding, Event schedulers.",
                AppGuide = "1. Click 'Generate'.\n2. Click 'Build Min Heap'.\n3. Watch smallest numbers bubble up to the root."
            };

             _knowledgeBase["maxheap"] = new AlgoInfo {
                Title = "Max Heap",
                Description = "Complete binary tree where parent >= children. Root is global maximum.",
                Time = "O(log N)", Space = "O(N)",
                RealWorld = "Job scheduling (priority), Top-K elements problem.",
                AppGuide = "1. Click 'Generate'.\n2. Click 'Build Max Heap'.\n3. Watch largest numbers bubble up to the root."
            };

            _knowledgeBase["huffman"] = new AlgoInfo {
                Title = "Huffman Coding",
                Description = "Lossless compression that assigns shorter binary codes to frequent characters.",
                Time = "O(N log N)", Space = "O(N)",
                RealWorld = "ZIP compression, Multimedia formats (JPEG, MP3).",
                AppGuide = "1. Enter text (e.g. 'hello').\n2. Click 'Encode'.\n3. Visualize the tree being built from frequencies."
            };

            _knowledgeBase["tsp"] = new AlgoInfo {
                Title = "Traveling Salesman (TSP)",
                Description = "Find shortest loop visiting all cities.",
                Time = "NP-Hard", Space = "O(N)",
                RealWorld = "Delivery trucks, manufacturing robots, DNA sequencing.",
                AppGuide = "1. **Click on board** to place cities.\n2. Click 'Run TSP'.\n3. Watch the salesman find a path."
            };

            _knowledgeBase["nqueens"] = new AlgoInfo {
                Title = "N-Queens Problem",
                Description = "Place N queens so they don't attack each other.",
                Time = "O(N!)", Space = "O(N)",
                RealWorld = "Constraint satisfaction testing, Load balancing.",
                AppGuide = "1. Choose N (Board Size).\n2. Click 'Solve'.\n3. Watch the Backtracking (red flashes) when it gets stuck."
            };

            _knowledgeBase["knight"] = new AlgoInfo {
                Title = "Knight's Tour",
                Description = "Move Knight to every square exactly once.",
                Time = "O(N²)", Space = "O(N²)",
                RealWorld = "Cryptographic algorithms, Games.",
                AppGuide = "1. **Click start square**.\n2. Visualization starts immediately.\n3. Watch it use Warnsdorff's rule to find the path."
            };
        }
    }
}

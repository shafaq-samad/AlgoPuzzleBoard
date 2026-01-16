using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class HeapSortService
    {
        public HeapSortResult GenerateSortingSteps(int[] inputArray, bool isAscending = true)
        {
            var result = new HeapSortResult();
            var array = (int[])inputArray.Clone();
            int n = array.Length;
            int totalComparisons = 0;
            int totalSwaps = 0;
            var sortedIndices = new List<int>();

            // Initial state
            result.Steps.Add(new HeapSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Initial array state",
                SortedIndices = sortedIndices.ToArray(),
                HeapSize = n
            });

            // Phase 1: Build heap
            result.Steps.Add(new HeapSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = $"Building {(isAscending ? "max" : "min")} heap...",
                SortedIndices = sortedIndices.ToArray(),
                HeapSize = n
            });

            // Build heap (rearrange array)
            for (int i = n / 2 - 1; i >= 0; i--)
            {
                Heapify(array, n, i, isAscending, result, ref totalComparisons, ref totalSwaps, sortedIndices);
            }

            result.Steps.Add(new HeapSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = $"{(isAscending ? "Max" : "Min")} heap built successfully",
                SortedIndices = sortedIndices.ToArray(),
                HeapSize = n
            });

            // Phase 2: Extract elements from heap one by one
            for (int i = n - 1; i > 0; i--)
            {
                // Move current root to end
                totalComparisons++;
                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = 0,
                    CompareIndex2 = i,
                    Swapped = false,
                    Description = $"Extracting root element {array[0]} to position {i}",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = i
                });

                // Swap root with last element
                int temp = array[0];
                array[0] = array[i];
                array[i] = temp;
                totalSwaps++;

                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = 0,
                    CompareIndex2 = i,
                    Swapped = true,
                    Description = $"Swapped {array[i]} with {array[0]}. Element {array[i]} is now in final position",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = i
                });

                // Mark as sorted
                sortedIndices.Add(i);

                // Heapify the reduced heap
                Heapify(array, i, 0, isAscending, result, ref totalComparisons, ref totalSwaps, sortedIndices);
            }

            // Mark first element as sorted
            sortedIndices.Add(0);

            // Final sorted state
            result.Steps.Add(new HeapSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Sorting complete!",
                SortedIndices = sortedIndices.ToArray(),
                HeapSize = 0
            });

            result.TotalComparisons = totalComparisons;
            result.TotalSwaps = totalSwaps;

            return result;
        }

        private void Heapify(int[] array, int heapSize, int rootIndex, bool isAscending, 
            HeapSortResult result, ref int totalComparisons, ref int totalSwaps, List<int> sortedIndices)
        {
            int extremeIndex = rootIndex; // Initialize as root (will be largest for max heap, smallest for min heap)
            int leftChild = 2 * rootIndex + 1;
            int rightChild = 2 * rootIndex + 2;

            // Compare with left child
            if (leftChild < heapSize)
            {
                totalComparisons++;
                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = extremeIndex,
                    CompareIndex2 = leftChild,
                    Swapped = false,
                    Description = $"Comparing parent {array[extremeIndex]} with left child {array[leftChild]}",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = heapSize
                });

                bool shouldUpdate = isAscending ? 
                    (array[leftChild] > array[extremeIndex]) : 
                    (array[leftChild] < array[extremeIndex]);

                if (shouldUpdate)
                {
                    extremeIndex = leftChild;
                }
            }

            // Compare with right child
            if (rightChild < heapSize)
            {
                totalComparisons++;
                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = extremeIndex,
                    CompareIndex2 = rightChild,
                    Swapped = false,
                    Description = $"Comparing {array[extremeIndex]} with right child {array[rightChild]}",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = heapSize
                });

                bool shouldUpdate = isAscending ? 
                    (array[rightChild] > array[extremeIndex]) : 
                    (array[rightChild] < array[extremeIndex]);

                if (shouldUpdate)
                {
                    extremeIndex = rightChild;
                }
            }

            // If extreme is not root, swap and continue heapifying
            if (extremeIndex != rootIndex)
            {
                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = rootIndex,
                    CompareIndex2 = extremeIndex,
                    Swapped = false,
                    Description = $"Swapping {array[rootIndex]} with {array[extremeIndex]} to maintain heap property",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = heapSize
                });

                int temp = array[rootIndex];
                array[rootIndex] = array[extremeIndex];
                array[extremeIndex] = temp;
                totalSwaps++;

                result.Steps.Add(new HeapSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = rootIndex,
                    CompareIndex2 = extremeIndex,
                    Swapped = true,
                    Description = $"Swapped {array[extremeIndex]} with {array[rootIndex]}",
                    SortedIndices = sortedIndices.ToArray(),
                    HeapSize = heapSize
                });

                // Recursively heapify the affected sub-tree
                Heapify(array, heapSize, extremeIndex, isAscending, result, ref totalComparisons, ref totalSwaps, sortedIndices);
            }
        }

        public bool ValidateInput(int[] array, out string errorMessage)
        {
            errorMessage = string.Empty;

            if (array == null || array.Length == 0)
            {
                errorMessage = "Array cannot be empty";
                return false;
            }

            if (array.Length < 2)
            {
                errorMessage = "Array must have at least 2 elements";
                return false;
            }

            if (array.Length > 20)
            {
                errorMessage = "Array size cannot exceed 20 elements";
                return false;
            }

            return true;
        }
    }
}

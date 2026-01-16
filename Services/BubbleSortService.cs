using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class BubbleSortService
    {
        public BubbleSortResult GenerateSortingSteps(int[] inputArray, bool isAscending = true)
        {
            var result = new BubbleSortResult();
            var array = (int[])inputArray.Clone();
            int n = array.Length;
            int totalComparisons = 0;
            int totalSwaps = 0;
            var sortedIndices = new List<int>();

            // Initial state
            result.Steps.Add(new BubbleSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Initial array state",
                PassNumber = 0,
                SortedIndices = sortedIndices.ToArray()
            });

            // Bubble sort algorithm with step tracking
            for (int pass = 0; pass < n - 1; pass++)
            {
                bool swappedInPass = false;

                for (int i = 0; i < n - pass - 1; i++)
                {
                    totalComparisons++;

                    // Comparison step
                    result.Steps.Add(new BubbleSortStep
                    {
                        Array = (int[])array.Clone(),
                        CompareIndex1 = i,
                        CompareIndex2 = i + 1,
                        Swapped = false,
                        Description = $"Comparing {array[i]} and {array[i + 1]}",
                        PassNumber = pass + 1,
                        SortedIndices = sortedIndices.ToArray()
                    });

                    bool shouldSwap = isAscending ? (array[i] > array[i + 1]) : (array[i] < array[i + 1]);
                    
                    if (shouldSwap)
                    {
                        // Swap
                        int temp = array[i];
                        array[i] = array[i + 1];
                        array[i + 1] = temp;
                        swappedInPass = true;
                        totalSwaps++;

                        // Swap step
                        result.Steps.Add(new BubbleSortStep
                        {
                            Array = (int[])array.Clone(),
                            CompareIndex1 = i,
                            CompareIndex2 = i + 1,
                            Swapped = true,
                            Description = $"Swapped {array[i + 1]} and {array[i]}",
                            PassNumber = pass + 1,
                            SortedIndices = sortedIndices.ToArray()
                        });
                    }
                }

                // Mark the last element of this pass as sorted
                sortedIndices.Add(n - pass - 1);

                // End of pass
                result.Steps.Add(new BubbleSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = -1,
                    CompareIndex2 = -1,
                    Swapped = false,
                    Description = $"Pass {pass + 1} completed. Element at index {n - pass - 1} is now in its final position.",
                    PassNumber = pass + 1,
                    SortedIndices = sortedIndices.ToArray()
                });

                // Early termination if no swaps occurred
                if (!swappedInPass)
                {
                    // Mark all remaining elements as sorted
                    for (int i = 0; i < n - pass - 1; i++)
                    {
                        if (!sortedIndices.Contains(i))
                        {
                            sortedIndices.Add(i);
                        }
                    }
                    result.Steps.Add(new BubbleSortStep
                    {
                        Array = (int[])array.Clone(),
                        CompareIndex1 = -1,
                        CompareIndex2 = -1,
                        Swapped = false,
                        Description = "Array is already sorted! No swaps needed.",
                        PassNumber = pass + 1,
                        SortedIndices = sortedIndices.ToArray()
                    });
                    break;
                }
            }

            // Mark first element as sorted if not already
            if (!sortedIndices.Contains(0))
            {
                sortedIndices.Add(0);
            }

            // Final sorted state
            result.Steps.Add(new BubbleSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Sorting complete!",
                PassNumber = -1,
                SortedIndices = sortedIndices.ToArray()
            });

            result.TotalComparisons = totalComparisons;
            result.TotalSwaps = totalSwaps;

            return result;
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

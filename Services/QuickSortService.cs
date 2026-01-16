using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class QuickSortService
    {
        private QuickSortResult _result = new QuickSortResult();
        private int _totalComparisons = 0;
        private int _totalSwaps = 0;
        private List<int> _sortedIndices = new List<int>();
        private bool _isAscending = true;

        public QuickSortResult GenerateSortingSteps(int[] inputArray, bool isAscending = true)
        {
            _result = new QuickSortResult();
            var array = (int[])inputArray.Clone();
            int n = array.Length;
            _totalComparisons = 0;
            _totalSwaps = 0;
            _sortedIndices = new List<int>();
            _isAscending = isAscending;

            // Initial state
            _result.Steps.Add(new QuickSortStep
            {
                Array = (int[])array.Clone(),
                Description = "Initial array state",
                SortedIndices = _sortedIndices.ToArray(),
            });

            QuickSort(array, 0, n - 1);

            // Mark all as sorted
            for (int i = 0; i < n; i++)
            {
                if (!_sortedIndices.Contains(i))
                {
                    _sortedIndices.Add(i);
                }
            }

            _result.Steps.Add(new QuickSortStep
            {
                Array = (int[])array.Clone(),
                Description = "Sorting complete!",
                SortedIndices = _sortedIndices.ToArray(),
                IsSorted = true
            });

            _result.TotalComparisons = _totalComparisons;
            _result.TotalSwaps = _totalSwaps;

            return _result;
        }

        private void QuickSort(int[] array, int low, int high)
        {
            if (low < high)
            {
                // Visualization: Show partition range
                _result.Steps.Add(new QuickSortStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Partitioning range [{low}..{high}]",
                    SortedIndices = _sortedIndices.ToArray(),
                    PivotIndex = -1,
                    LeftIndex = low,
                    RightIndex = high
                });

                int pi = Partition(array, low, high);

                // Mark pivot as sorted
                _sortedIndices.Add(pi);
                _result.Steps.Add(new QuickSortStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Pivot {array[pi]} placed at correct position {pi}",
                    SortedIndices = _sortedIndices.ToArray(),
                    PivotIndex = pi, // Highlight placed pivot
                    IsPivotPlaced = true
                });

                QuickSort(array, low, pi - 1);
                QuickSort(array, pi + 1, high);
            }
            else if (low == high)
            {
                // Single element is sorted
                 if (!_sortedIndices.Contains(low))
                {
                    _sortedIndices.Add(low);
                     _result.Steps.Add(new QuickSortStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"Element {array[low]} is sorted",
                        SortedIndices = _sortedIndices.ToArray()
                    });
                }
            }
        }

        private int Partition(int[] array, int low, int high)
        {
            int pivot = array[high];
            int i = (low - 1);

            _result.Steps.Add(new QuickSortStep
            {
                Array = (int[])array.Clone(),
                Description = $"Selected pivot: {pivot} (at index {high})",
                SortedIndices = _sortedIndices.ToArray(),
                PivotIndex = high,
                LeftIndex = low,
                RightIndex = high - 1 // Range being scanned
            });

            for (int j = low; j < high; j++)
            {
                _totalComparisons++;
                
                _result.Steps.Add(new QuickSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = j,
                    CompareIndex2 = high, // Pivot
                    Description = $"Comparing {array[j]} with pivot {pivot}",
                    SortedIndices = _sortedIndices.ToArray(),
                    PivotIndex = high,
                    CurrentIndex = j
                });

                bool shouldSwap = _isAscending ? (array[j] < pivot) : (array[j] > pivot);

                if (shouldSwap)
                {
                    i++;
                    Swap(array, i, j);
                    _totalSwaps++;
                }
            }

            Swap(array, i + 1, high);
            _totalSwaps++;
            
            return i + 1;
        }

        private void Swap(int[] array, int a, int b)
        {
            if (a == b) return;

            int temp = array[a];
            array[a] = array[b];
            array[b] = temp;

            _result.Steps.Add(new QuickSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = a,
                CompareIndex2 = b,
                Swapped = true,
                Description = $"Swapped {array[a]} and {array[b]}",
                SortedIndices = _sortedIndices.ToArray()
            });
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

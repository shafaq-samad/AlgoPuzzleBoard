using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class MergeSortService
    {
        private MergeSortResult _result = new MergeSortResult();
        private int _totalComparisons = 0;
        private int _totalMerges = 0;
        private List<int> _sortedIndices = new List<int>();
        private bool _isAscending = true;

        public MergeSortResult GenerateSortingSteps(int[] inputArray, bool isAscending = true)
        {
            _result = new MergeSortResult();
            var array = (int[])inputArray.Clone();
            int n = array.Length;
            _totalComparisons = 0;
            _totalMerges = 0;
            _sortedIndices = new List<int>();
            _isAscending = isAscending;

            // Initial state
            _result.Steps.Add(new MergeSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Initial array state",
                SortedIndices = _sortedIndices.ToArray(),
                LeftIndex = -1,
                RightIndex = -1,
                MergingRange = new int[0]
            });

            _result.Steps.Add(new MergeSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Starting merge sort - dividing array into smaller subarrays",
                SortedIndices = _sortedIndices.ToArray(),
                LeftIndex = -1,
                RightIndex = -1,
                MergingRange = new int[0]
            });

            // Perform merge sort
            MergeSort(array, 0, n - 1);

            // Mark all as sorted
            for (int i = 0; i < n; i++)
            {
                if (!_sortedIndices.Contains(i))
                {
                    _sortedIndices.Add(i);
                }
            }

            // Final sorted state
            _result.Steps.Add(new MergeSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = "Sorting complete!",
                SortedIndices = _sortedIndices.ToArray(),
                LeftIndex = -1,
                RightIndex = -1,
                MergingRange = new int[0]
            });

            _result.TotalComparisons = _totalComparisons;
            _result.TotalMerges = _totalMerges;

            return _result;
        }

        private void MergeSort(int[] array, int left, int right)
        {
            if (left < right)
            {
                int mid = left + (right - left) / 2;

                _result.Steps.Add(new MergeSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = -1,
                    CompareIndex2 = -1,
                    Swapped = false,
                    Description = $"Dividing array: [{left}..{mid}] and [{mid + 1}..{right}]",
                    SortedIndices = _sortedIndices.ToArray(),
                    LeftIndex = left,
                    RightIndex = right,
                    MergingRange = new int[0]
                });

                // Sort first half
                MergeSort(array, left, mid);

                // Sort second half
                MergeSort(array, mid + 1, right);

                // Merge the sorted halves
                Merge(array, left, mid, right);
            }
        }

        private void Merge(int[] array, int left, int mid, int right)
        {
            _result.Steps.Add(new MergeSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = $"Merging subarrays [{left}..{mid}] and [{mid + 1}..{right}]",
                SortedIndices = _sortedIndices.ToArray(),
                LeftIndex = left,
                RightIndex = right,
                MergingRange = Enumerable.Range(left, right - left + 1).ToArray()
            });

            int n1 = mid - left + 1;
            int n2 = right - mid;

            // Create temp arrays
            int[] leftArray = new int[n1];
            int[] rightArray = new int[n2];

            // Copy data to temp arrays
            for (int x = 0; x < n1; x++)
                leftArray[x] = array[left + x];
            for (int x = 0; x < n2; x++)
                rightArray[x] = array[mid + 1 + x];

            // Merge the temp arrays back
            int i = 0, j = 0, k = left;

            while (i < n1 && j < n2)
            {
                _totalComparisons++;

                _result.Steps.Add(new MergeSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = left + i,
                    CompareIndex2 = mid + 1 + j,
                    Swapped = false,
                    Description = $"Comparing {leftArray[i]} and {rightArray[j]}",
                    SortedIndices = _sortedIndices.ToArray(),
                    LeftIndex = left,
                    RightIndex = right,
                    MergingRange = Enumerable.Range(left, right - left + 1).ToArray()
                });

                bool shouldTakeLeft = _isAscending ? 
                    (leftArray[i] <= rightArray[j]) : 
                    (leftArray[i] >= rightArray[j]);

                if (shouldTakeLeft)
                {
                    array[k] = leftArray[i];
                    i++;
                }
                else
                {
                    array[k] = rightArray[j];
                    j++;
                }

                _totalMerges++;

                _result.Steps.Add(new MergeSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = k,
                    CompareIndex2 = -1,
                    Swapped = true,
                    Description = $"Placed {array[k]} at position {k}",
                    SortedIndices = _sortedIndices.ToArray(),
                    LeftIndex = left,
                    RightIndex = right,
                    MergingRange = Enumerable.Range(left, right - left + 1).ToArray()
                });

                k++;
            }

            // Copy remaining elements of leftArray
            while (i < n1)
            {
                array[k] = leftArray[i];
                _totalMerges++;

                _result.Steps.Add(new MergeSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = k,
                    CompareIndex2 = -1,
                    Swapped = true,
                    Description = $"Copying remaining element {array[k]} to position {k}",
                    SortedIndices = _sortedIndices.ToArray(),
                    LeftIndex = left,
                    RightIndex = right,
                    MergingRange = Enumerable.Range(left, right - left + 1).ToArray()
                });

                i++;
                k++;
            }

            // Copy remaining elements of rightArray
            while (j < n2)
            {
                array[k] = rightArray[j];
                _totalMerges++;

                _result.Steps.Add(new MergeSortStep
                {
                    Array = (int[])array.Clone(),
                    CompareIndex1 = k,
                    CompareIndex2 = -1,
                    Swapped = true,
                    Description = $"Copying remaining element {array[k]} to position {k}",
                    SortedIndices = _sortedIndices.ToArray(),
                    LeftIndex = left,
                    RightIndex = right,
                    MergingRange = Enumerable.Range(left, right - left + 1).ToArray()
                });

                j++;
                k++;
            }

            _result.Steps.Add(new MergeSortStep
            {
                Array = (int[])array.Clone(),
                CompareIndex1 = -1,
                CompareIndex2 = -1,
                Swapped = false,
                Description = $"Merged subarray [{left}..{right}] successfully",
                SortedIndices = _sortedIndices.ToArray(),
                LeftIndex = left,
                RightIndex = right,
                MergingRange = new int[0]
            });

            // Mark this range as sorted if it's a small subarray
            if (right - left + 1 <= 2)
            {
                for (int idx = left; idx <= right; idx++)
                {
                    if (!_sortedIndices.Contains(idx))
                    {
                        _sortedIndices.Add(idx);
                    }
                }
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

using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class RadixSortService
    {
        private RadixSortResult _result = new RadixSortResult();

        public RadixSortResult GenerateSortingSteps(int[] inputArray, bool isAscending = true)
        {
            _result = new RadixSortResult();
            var array = (int[])inputArray.Clone();
            int n = array.Length;
            
            // Radix Sort works best with non-negative integers
            // For this visualization, we'll converting negatives to absolute for sorting or just assume positive.
            // Let's handle generic inputs by finding min/max. 
            // Standard Radix sort is easiest with positive numbers. If array has negatives, we can offset them but that complicates visualization.
            // We'll trust input is positive based on current random generator (1-100).
            // If negatives exist, we'll just sort absolute values for visual simplicity or implement a robust version.
            // Let's implement LSD Radix Sort for positive integers.

            int maxVal = GetMax(array, n);
            int passes = 0;

            // Initial state
            _result.Steps.Add(new RadixSortStep
            {
                Array = (int[])array.Clone(),
                Description = "Initial array state",
            });

            // Do counting sort for every digit. Note that instead of passing digit number, exp is passed. 
            // exp is 10^i where i is current digit number
            for (int exp = 1; maxVal / exp > 0; exp *= 10)
            {
                CountingSort(array, n, exp, isAscending);
                passes++;
            }

            // Final sorted state
            _result.Steps.Add(new RadixSortStep
            {
                Array = (int[])array.Clone(),
                Description = "Sorting complete!",
                IsSorted = true,
                SortedIndices = Enumerable.Range(0, n).ToArray()
            });

            _result.TotalPassthroughs = passes;

            return _result;
        }

        private int GetMax(int[] arr, int n)
        {
            int mx = arr[0];
            for (int i = 1; i < n; i++)
                if (arr[i] > mx)
                    mx = arr[i];
            return mx;
        }

        private void CountingSort(int[] arr, int n, int exp, bool isAscending)
        {
            int[] output = new int[n]; // output array
            int[] count = new int[10];

            // Initialize count array
            for (int i = 0; i < 10; i++)
                count[i] = 0;

            // Store count of occurrences in count[]
            // Visualization: Distribution Phase
            _result.Steps.Add(new RadixSortStep
            {
                Array = (int[])arr.Clone(),
                Description = $"Counting frequencies for digit placed at {exp}s",
                CurrentDigitPlace = exp,
                IsDistributing = true
            });

            for (int i = 0; i < n; i++)
            {
                int digit = (arr[i] / exp) % 10;
                count[digit]++;
            }

            // Change count[i] so that count[i] now contains actual
            // position of this digit in output[]
            if (isAscending)
            {
                for (int i = 1; i < 10; i++)
                    count[i] += count[i - 1];
            }
            else
            {
                // For descending, we accumulate from the end or reverse logic
                // Easier logic: Count occurrences as normal, then build output array backwards?
                // Actually for stable sort descending:
                // Accumulate from 9 down to 0
                 for (int i = 8; i >= 0; i--)
                    count[i] += count[i + 1];
            }

            // Build the output array
            // Visualization: Collection Phase
             _result.Steps.Add(new RadixSortStep
            {
                Array = (int[])arr.Clone(),
                Description = $"re-distributing array based on {exp}s digit",
                CurrentDigitPlace = exp,
                IsCollecting = true
            });

            // Must go in reverse to keep stable sort order
            for (int i = n - 1; i >= 0; i--)
            {
                int digit = (arr[i] / exp) % 10;
                
                // Logic depends on ascending/descending accumulation
                // For Ascending: count[digit] is the position (1-based usually, so -1)
                // For Descending: same concept if accumulated correctly
                
                output[count[digit] - 1] = arr[i];
                count[digit]--;
                
                // Fine-grained visualization step (optional)
                // Adding every single move might be too much, but good for "Collection" animation
                // Let's add intermediate steps for larger arrays might slow it down too much
                // We'll just update at the end of the pass or chunks. 
                // Let's update partially to show progress? No, standard view usually shows the whole "pass" result.
                // But for "Visualizer", seeing them move is nice.
                
                // To keep it simple but visual, we usually just show the result of the pass.
                // BUT, to look cool, let's update the main array in chunks or just once per pass.
                // Let's stick to updating once per pass for the main array, 
                // but we can add a step showing "Re-ordering based on current digit".
            }

            // Copy the output array to arr[], so that arr now
            // contains sorted numbers according to current digit
            for (int i = 0; i < n; i++)
                arr[i] = output[i];

            _result.Steps.Add(new RadixSortStep
            {
                Array = (int[])arr.Clone(),
                Description = $"Completed pass for {exp}s digit",
                CurrentDigitPlace = exp
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

            // Radix sort limitation for this basic implementation
            foreach(var num in array)
            {
                if (num < 0)
                {
                    errorMessage = "Radix Sort (LSD) requires non-negative integers for this visualization.";
                    return false;
                }
            }

            return true;
        }
    }
}

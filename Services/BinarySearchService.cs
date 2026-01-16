using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class BinarySearchService
    {
        public BinarySearchResult GenerateSearchSteps(int[] inputArray, int target)
        {
            var result = new BinarySearchResult();
            int comparisons = 0;

            // Check if array is sorted
            bool isSorted = true;
            for (int i = 0; i < inputArray.Length - 1; i++)
            {
                if (inputArray[i] > inputArray[i + 1])
                {
                    isSorted = false;
                    break;
                }
            }

            // Work with a local copy that we can modify/sort
            int[] array = (int[])inputArray.Clone();

            if (!isSorted)
            {
                // Add a step showing the unsorted state
                result.Steps.Add(new BinarySearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = "Input array is unsorted. Binary Search requires a sorted array.",
                    Low = -1, High = -1, Mid = -1, Target = target
                });

                // Sort the array
                Array.Sort(array);

                // Add a step showing the sorted state
                result.Steps.Add(new BinarySearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = "Array has been sorted. Now we can proceed with Binary Search.",
                    Low = -1, High = -1, Mid = -1, Target = target
                });
            }

            int low = 0;
            int high = array.Length - 1;

            result.Steps.Add(new BinarySearchStep
            {
                Array = (int[])array.Clone(),
                Description = $"Initial Range: Low={low}, High={high}. Target={target}",
                Low = low,
                High = high,
                Mid = -1,
                Target = target
            });

            bool found = false;

            while (low <= high)
            {
                int mid = low + (high - low) / 2;
                comparisons++;

                result.Steps.Add(new BinarySearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Calculating Mid: ({low} + {high}) / 2 = {mid}. Value is {array[mid]}.",
                    Low = low,
                    High = high,
                    Mid = mid,
                    Target = target
                });

                if (array[mid] == target)
                {
                    result.Steps.Add(new BinarySearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"Match found at index {mid}! ({array[mid]} == {target})",
                        Low = low,
                        High = high,
                        Mid = mid,
                        IsFound = true,
                        Target = target
                    });
                    result.FoundIndex = mid;
                    found = true;
                    break;
                }

                if (array[mid] < target)
                {
                    result.Steps.Add(new BinarySearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"{array[mid]} is smaller than {target}. Since the array is sorted, the target must be in the RIGHT side. Ignoring the left half.",
                        Low = low,
                        High = high,
                        Mid = mid,
                        Target = target
                    });
                    low = mid + 1;
                }
                else
                {
                    result.Steps.Add(new BinarySearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"{array[mid]} is larger than {target}. Since the array is sorted, the target must be in the LEFT side. Ignoring the right half.",
                        Low = low,
                        High = high,
                        Mid = mid,
                        Target = target
                    });
                    high = mid - 1;
                }
            }

            if (!found)
            {
                result.Steps.Add(new BinarySearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Target {target} not found. Search space exhausted (Low > High).",
                    Low = low,
                    High = high,
                    IsNotFound = true,
                    Target = target
                });
            }

            result.Comparisons = comparisons;
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

            if (array.Length > 20)
            {
                errorMessage = "Array size cannot exceed 20 elements";
                return false;
            }

            return true;
        }
    }
}

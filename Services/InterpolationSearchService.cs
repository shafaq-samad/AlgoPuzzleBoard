using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class InterpolationSearchService
    {
        public InterpolationSearchResult GenerateSearchSteps(int[] inputArray, int target)
        {
            var result = new InterpolationSearchResult();
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
                result.Steps.Add(new InterpolationSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = "Input array is unsorted. Interpolation Search requires a sorted array.",
                    Low = -1, High = -1, Probe = -1, Target = target
                });

                Array.Sort(array);

                result.Steps.Add(new InterpolationSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = "Array has been sorted. Now we can proceed with Interpolation Search.",
                    Low = -1, High = -1, Probe = -1, Target = target
                });
            }

            int low = 0;
            int high = array.Length - 1;

            result.Steps.Add(new InterpolationSearchStep
            {
                Array = (int[])array.Clone(),
                Description = $"Initial Range: Low={low}, High={high}. Target={target}",
                Low = low,
                High = high,
                Probe = -1,
                Target = target
            });

            bool found = false;

            while (low <= high && target >= array[low] && target <= array[high])
            {
                comparisons++;

                if (low == high)
                {
                    if (array[low] == target)
                    {
                        result.Steps.Add(new InterpolationSearchStep
                        {
                            Array = (int[])array.Clone(),
                            Description = $"Only one element left. Match found at index {low}!",
                            Low = low,
                            High = high,
                            Probe = low,
                            IsFound = true,
                            Target = target
                        });
                        result.FoundIndex = low;
                        found = true;
                    }
                    else
                    {
                        result.Steps.Add(new InterpolationSearchStep
                        {
                            Array = (int[])array.Clone(),
                            Description = $"Only one element left ({array[low]}). Not the target.",
                            Low = low,
                            High = high,
                            Probe = low,
                            IsNotFound = true,
                            Target = target
                        });
                    }
                    break;
                }

                // Interpolation formula
                // pos = lo + ((x - arr[lo]) * (hi - lo) / (arr[hi] - arr[lo]))
                double numerator = (double)(target - array[low]) * (high - low);
                double denominator = (double)(array[high] - array[low]);
                int pos = low + (int)(numerator / denominator);
                
                result.Steps.Add(new InterpolationSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Calculating Probe Position: {low} + (({target} - {array[low]}) * ({high} - {low})) / ({array[high]} - {array[low]}) = {pos}. Value is {array[pos]}.",
                    Low = low,
                    High = high,
                    Probe = pos,
                    Target = target
                });

                if (array[pos] == target)
                {
                    result.Steps.Add(new InterpolationSearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"Match found at index {pos}!",
                        Low = low,
                        High = high,
                        Probe = pos,
                        IsFound = true,
                        Target = target
                    });
                    result.FoundIndex = pos;
                    found = true;
                    break;
                }

                if (array[pos] < target)
                {
                    result.Steps.Add(new InterpolationSearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"{array[pos]} is smaller than {target}. Target must be in the upper part (Right). New Low = {pos + 1}",
                        Low = low,
                        High = high,
                        Probe = pos,
                        Target = target
                    });
                    low = pos + 1;
                }
                else
                {
                    result.Steps.Add(new InterpolationSearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"{array[pos]} is larger than {target}. Target must be in the lower part (Left). New High = {pos - 1}",
                        Low = low,
                        High = high,
                        Probe = pos,
                        Target = target
                    });
                    high = pos - 1;
                }
            }

            if (!found && result.FoundIndex == -1) // Ensure we didn't already find it in the loop
            {
                 result.Steps.Add(new InterpolationSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Target {target} not found within the range.",
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

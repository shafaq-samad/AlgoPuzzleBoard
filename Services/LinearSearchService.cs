using AlgoPuzzleBoard.MVC.Models;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class LinearSearchService
    {
        public LinearSearchResult GenerateSearchSteps(int[] array, int target)
        {
            var result = new LinearSearchResult();
            int comparisons = 0;

            // Initial step
            result.Steps.Add(new LinearSearchStep
            {
                Array = (int[])array.Clone(),
                Description = $"Starting search for target value: {target}",
                Target = target
            });

            bool found = false;

            for (int i = 0; i < array.Length; i++)
            {
                comparisons++;
                
                // Visualization step: Checking current index
                result.Steps.Add(new LinearSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Checking index {i}: Is {array[i]} == {target}?",
                    CurrentIndex = i,
                    Target = target
                });

                if (array[i] == target)
                {
                    result.Steps.Add(new LinearSearchStep
                    {
                        Array = (int[])array.Clone(),
                        Description = $"Match found at index {i}!",
                        CurrentIndex = i,
                        IsFound = true,
                        Target = target
                    });
                    
                    result.FoundIndex = i;
                    found = true;
                    break; 
                }
            }

            if (!found)
            {
                result.Steps.Add(new LinearSearchStep
                {
                    Array = (int[])array.Clone(),
                    Description = $"Target {target} not found in the array.",
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

using AlgoPuzzleBoard.MVC.Models;
using System.Collections.Generic;
using System.Linq;

namespace AlgoPuzzleBoard.MVC.Services
{
    public class HeapService
    {
        public HeapResult BuildMaxHeap(List<int> input) => BuildHeap(input, true);
        public HeapResult BuildMinHeap(List<int> input) => BuildHeap(input, false);

        private HeapResult BuildHeap(List<int> input, bool isMax)
        {
            var result = new HeapResult();
            var arr = new List<int>(input);
            int n = arr.Count;

            result.Steps.Add(new HeapStep
            {
                Description = $"Initial array. Starting Build {(isMax ? "Max" : "Min")} Heap process.",
                Array = new List<int>(arr),
                Type = "Info"
            });

            for (int i = n / 2 - 1; i >= 0; i--)
            {
                Heapify(arr, n, i, result, isMax);
            }

            result.Steps.Add(new HeapStep
            {
                Description = $"{(isMax ? "Max" : "Min")} Heap construction complete!",
                Array = new List<int>(arr),
                Type = "Complete"
            });

            result.FinalHeap = arr;
            return result;
        }

        private void Heapify(List<int> arr, int n, int i, HeapResult result, bool isMax)
        {
            int target = i;
            int left = 2 * i + 1;
            int right = 2 * i + 2;

            result.Steps.Add(new HeapStep
            {
                Description = $"Checking node at index {i} (value: {arr[i]}) with its children.",
                Array = new List<int>(arr),
                HighlightIndices = new List<int> { i },
                Type = "Compare"
            });

            if (left < n)
            {
                bool violation = isMax ? arr[left] > arr[target] : arr[left] < arr[target];
                if (violation) target = left;
            }

            if (right < n)
            {
                bool violation = isMax ? arr[right] > arr[target] : arr[right] < arr[target];
                if (violation) target = right;
            }

            if (target != i)
            {
                result.Steps.Add(new HeapStep
                {
                    Description = $"Child at index {target} ({arr[target]}) is {(isMax ? "greater" : "smaller")} than parent ({arr[i]}). Swapping.",
                    Array = new List<int>(arr),
                    HighlightIndices = new List<int> { i, target },
                    SwapIndices = new List<int> { i, target },
                    Type = "Swap"
                });

                int swap = arr[i];
                arr[i] = arr[target];
                arr[target] = swap;

                result.Steps.Add(new HeapStep
                {
                    Description = "Nodes swapped. Moving down the tree.",
                    Array = new List<int>(arr),
                    HighlightIndices = new List<int> { target },
                    Type = "Compare"
                });

                Heapify(arr, n, target, result, isMax);
            }
        }
    }
}

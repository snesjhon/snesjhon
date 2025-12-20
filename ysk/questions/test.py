def twosum(arr: list[int], target: int) -> list[int]:
    # we create an initial"sum" of this initial window
    # After we create this window, we loop through the list starting at k
    # we'll add and remove the left and right items, until we reach the end of our list
    # We'll also keep a 'maxsum' that allows us to return back what was the higher sum of our values
    i = 0
    j = len(arr) - 1

    while i < j:
        sum = arr[i] + arr[j]
        if sum == target:
            return [i, j]
        elif sum > target:
            j -= 1
        else:
            i += 1
    return []


print(twosum([2, 3, 4, 5, 8, 11, 18], 8))

function minMoves(h, w, h1, w1) {
    // Helper function to calculate the number of folds
    function calculateFolds(initial, target) {
        let folds = 0;
        while (initial > target) {
            // Halve the dimension
            initial = Math.floor(initial / 2);
            folds++;
        }
        // Folding succeeds if the dimension is >= target
        return initial >= target ? folds : -1;
    }

    // Debugging: Log input dimensions
    console.log(`Initial Dimensions: h=${h}, w=${w}, Target: h1=${h1}, w1=${w1}`);

    // Direct folding (h -> h1, w -> w1)
    const heightFoldsDirect = calculateFolds(h, h1);
    const widthFoldsDirect = calculateFolds(w, w1);
    const totalFoldsDirect =
        heightFoldsDirect !== -1 && widthFoldsDirect !== -1
            ? heightFoldsDirect + widthFoldsDirect
            : -1;

    // Rotated folding (h -> w1, w -> h1)
    const heightFoldsRotated = calculateFolds(h, w1);
    const widthFoldsRotated = calculateFolds(w, h1);
    const totalFoldsRotated =
        heightFoldsRotated !== -1 && widthFoldsRotated !== -1
            ? heightFoldsRotated + widthFoldsRotated
            : -1;

    // Debugging: Log intermediate results
    console.log(
        `Direct: Height Folds=${heightFoldsDirect}, Width Folds=${widthFoldsDirect}, Total=${totalFoldsDirect}`
    );
    console.log(
        `Rotated: Height Folds=${heightFoldsRotated}, Width Folds=${widthFoldsRotated}, Total=${totalFoldsRotated}`
    );

    // Return the minimum number of folds, or -1 if both are impossible
    if (totalFoldsDirect === -1 && totalFoldsRotated === -1) {
        console.log(`Direct and Rotated options are both invalid.`);
        return -1;
    }
    if (totalFoldsDirect === -1) return totalFoldsRotated;
    if (totalFoldsRotated === -1) return totalFoldsDirect;
    return Math.min(totalFoldsDirect, totalFoldsRotated);
}

// Test Cases
console.log(minMoves(2, 3, 2, 2)); // Expected: 1
console.log(minMoves(6, 3, 3, 1)); // Expected: 3
console.log(minMoves(14, 21, 8, 19)); // Expected: 2
console.log(minMoves(24, 29, 12, 23)); // Expected: 2
console.log(minMoves(4521421045, 3193945008, 88, 108)); // Large input
console.log(minMoves(999999999999999, 999999999999999, 7, 5)); // Large input
console.log(minMoves(185777, 478825, 23, 40)); // Edge case

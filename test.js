const ROWS_COUNT = 2;

const arr = [
  ["новая", "stip"],
  ["строка", "еще"],
  ["еще одна", "небольшая", "строка"],
];

const getPoemText = (currentBlock, currentRow, type) => {
  const oldBlocksText = arr
    .slice(0, currentBlock.index)
    .reduce((res, item) => res + item.join("\n") + "\n\n", "");
  const oldRowsText = arr[currentBlock.index]
    .slice(0, currentRow.index * ROWS_COUNT)
    .join("\n");
  const currentRowText = arr[currentBlock.index]
    .slice(
      currentRow.index * ROWS_COUNT,
      currentRow.index * ROWS_COUNT + ROWS_COUNT
    )
    .join("\n");
  switch (type) {
    case "full":
      if (!oldRowsText) return oldBlocksText + currentRowText;
      return oldBlocksText + oldRowsText + "\n" + currentRowText;
    case "block":
      if (!oldRowsText) return currentRowText;
      return oldRowsText + "\n" + currentRowText;
    case "row":
      return currentRowText;
    default:
      return currentRowText;
  }
};

console.log(
  getPoemText({ index: 2, rowsCount: 2 }, { index: 0, isLast: true }, "full")
);

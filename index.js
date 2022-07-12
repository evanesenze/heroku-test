const express = require("express");
const base = require("./base.json").data;
const baseBlocks = Object.entries(base)
  .map(([key, value]) => [
    value.id,
    value.text.split("\n\n").map((item) => item.split("\n")),
  ])
  .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
const app = express();

app.use(express.json());
const port = process.env.PORT || 3000;
const ROWS_COUNT = 2;

const hello = {
  response: {
    text: "Здравствуйте! Выберите стих для заучивания",
    tts: "Здравствуйте! Выберите стих для заучивания",
    buttons: [
      {
        title: "Агния Барто 'Так на так'",
        payload: { selectedPoemId: 1 },
        hide: true,
      },
      {
        title: "Константин Симонов 'Жди меня, и я вернусь…'",
        payload: { selectedPoemId: 2 },
        hide: true,
      },
      {
        title: "Владимир Высоцкий 'Вот она, вот она…'",
        payload: { selectedPoemId: 3 },
        hide: true,
      },
    ],
    end_session: false,
  },
  session_state: {
    state: "selectPoem",
  },
  version: "1.0",
};

const menu = {
  response: {
    text: "Выберите стих для заучивания",
    tts: "Выберите стих для заучивания",
    buttons: [
      {
        title: "Агния Барто 'Так на так'",
        payload: { selectedPoemId: 1 },
        hide: true,
      },
      {
        title: "Константин Симонов 'Жди меня, и я вернусь…'",
        payload: { selectedPoemId: 2 },
        hide: true,
      },
      {
        title: "Владимир Высоцкий 'Вот она, вот она…'",
        payload: { selectedPoemId: 3 },
        hide: true,
      },
    ],
    end_session: false,
  },
  session_state: {
    state: "selectPoem",
  },
  version: "1.0",
};

const stih1 = {
  response: {
    text: "",
    tts: "",
    buttons: [
      {
        title: "Повторить",
        payload: { selectedId: 1 },
        hide: true,
      },
      {
        title: "Меню",
        payload: { goMain: true },
        hide: true,
      },
    ],
    end_session: false,
  },
  version: "1.0",
};

const getPoemText = (selectedPoemBlocks, currentBlock, currentRow, type) => {
  const oldBlocksText = selectedPoemBlocks
    .slice(0, currentBlock.index)
    .reduce((res, item) => res + item.join("\n") + "\n\n", "");
  const oldRowsText = selectedPoemBlocks[currentBlock.index]
    .slice(0, currentRow.index * ROWS_COUNT)
    .join("\n");
  const currentRowText = selectedPoemBlocks[currentBlock.index]
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

const getText = (session_state) => {
  const { selectedPoem, currentBlock, currentRow, textType } = session_state;
  const selectedPoemBlocks = baseBlocks[selectedPoem.id];
  const text = getPoemText(
    selectedPoemBlocks,
    currentBlock,
    currentRow,
    textType
  );
  return {
    response: {
      text,
      tts: text,
      buttons: [
        {
          title: "Повторить",
          payload: { repeat: true },
          hide: true,
        },
        {
          title: "Меню",
          payload: { goMenu: true },
          hide: true,
        },
        {
          title: "Далее",
          payload: { goNext: true },
          hide: true,
        },
      ],
      end_session: false,
    },
    session_state,
    version: "1.0",
  };
};

const getRowInfo = (currentBlock, index) => {
  return {
    index,
    isLast: currentBlock.rowsCount === index + 1,
  };
};

const getBlockInfo = (selectedPoem, index) => {
  const rows = baseBlocks[selectedPoem.id][index];
  return {
    index,
    rowsCount: Math.ceil(rows.length / ROWS_COUNT),
    isLast: selectedPoem.blocksCount === index,
    learnedRows: [0],
    complited: false,
  };
};

const getPoemInfo = (selectedPoemId) => {
  const blocks = baseBlocks[selectedPoemId];
  return {
    id: selectedPoemId,
    blocksCount: blocks.length - 1,
  };
};

const handleSelectPoemState = (request) => {
  const { selectedPoemId } = request?.payload;
  if (selectedPoemId) {
    const selectedPoem = getPoemInfo(selectedPoemId);
    const currentBlock = getBlockInfo(selectedPoem, 0);
    const currentRow = getRowInfo(currentBlock, 0);
    return getText({
      state: "learnPoem",
      textType: "row",
      selectedPoem,
      currentBlock,
      currentRow,
    });
  }
};

const handleLearnPoemState = (request, sessionState) => {
  const { goNext, goMenu, repeat } = request?.payload;
  const { selectedPoem, currentBlock, currentRow, textType } = sessionState;
  if (repeat) return getText(sessionState, "");
  if (goMenu) return menu;
  else if (goNext) {
    if (
      currentRow.isLast &&
      currentBlock.learnedRows.includes(currentRow.index)
    ) {
      if (currentBlock.isLast) {
        console.log("currentBlock is last");
        return getText({ ...sessionState, textType: "full" });
      }
      console.log("currentRow is last");
      if (
        currentBlock.rowsCount > 1 &&
        currentBlock.index != 0 &&
        !currentBlock.complited
      ) {
        console.log("currentBlock is not complited");
        sessionState.currentBlock.complited = true;
        return getText({ ...sessionState, textType: "full" });
      } else {
        console.log("currentBlock is complited");
        const nextBlock = getBlockInfo(selectedPoem, currentBlock.index + 1);
        const currentRow = getRowInfo(nextBlock, 0);
        return getText({
          ...sessionState,
          currentBlock: nextBlock,
          currentRow,
          textType: "block",
        });
      }
    } else {
      console.log("next row");
      if (currentBlock.learnedRows.includes(currentRow.index)) {
        console.log("new row");
        const newIndex = currentRow.index + 1;
        const nextRow = getRowInfo(currentBlock, newIndex);
        return getText({
          ...sessionState,
          currentRow: nextRow,
          textType: "row",
        });
      } else {
        currentBlock.learnedRows.push(currentRow.index);
        console.log("repeat block");
        return getText({ ...sessionState, currentBlock, textType: "block" });
      }
    }
  }
};

app.post("/", (req, res) => {
  const body = req.body;
  const { request, session, state } = body;
  if (session.new) return res.send(hello);

  switch (state.session?.state) {
    case "selectPoem":
      return res.send(handleSelectPoemState(request));
    case "learnPoem":
      return res.send(handleLearnPoemState(request, state.session));

    default:
      return res.send(menu);
  }

  // if (state) return res.send(handleState(state));
  // if (goMain) return res.send(menu);
  // if (selectedId) {
  //   const data = base[selectedId];
  //   // if (!data) return res.send(menu);
  //   const arr = data.text.split("\t").map((item) => item.split("\n"));
  //   console.log(arr);
  //   return res.send(getText(arr));
  // }
  // return res.send(menu);
});

app.listen(port, () => console.log("listen", port));

//&&
// (currentBlock.learnedRows.includes(currentRow.index) ||
// currentBlock.rowsCount === 1)

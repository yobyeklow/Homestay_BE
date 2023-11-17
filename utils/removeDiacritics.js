// remove diacritics from string
function removeDiacritics(inputString) {
  const diacriticsMap = [
    {
      base: "a",
      letters: [
        "à",
        "á",
        "ạ",
        "ả",
        "ã",
        "â",
        "ầ",
        "ấ",
        "ậ",
        "ẩ",
        "ẫ",
        "ă",
        "ằ",
        "ắ",
        "ặ",
        "ẳ",
        "ẵ",
      ],
    },
    {
      base: "e",
      letters: ["è", "é", "ẹ", "ẻ", "ẽ", "ê", "ề", "ế", "ệ", "ể", "ễ"],
    },
    { base: "i", letters: ["ì", "í", "ị", "ỉ", "ĩ"] },
    {
      base: "o",
      letters: [
        "ò",
        "ó",
        "ọ",
        "ỏ",
        "õ",
        "ô",
        "ồ",
        "ố",
        "ộ",
        "ổ",
        "ỗ",
        "ơ",
        "ờ",
        "ớ",
        "ợ",
        "ở",
        "ỡ",
      ],
    },
    {
      base: "u",
      letters: ["ù", "ú", "ụ", "ủ", "ũ", "ư", "ừ", "ứ", "ự", "ử", "ữ"],
    },
    { base: "y", letters: ["ỳ", "ý", "ỵ", "ỷ", "ỹ"] },
    { base: "d", letters: ["đ"] },
  ];

  for (let i = 0; i < diacriticsMap.length; i++) {
    const base = diacriticsMap[i].base;
    const letters = diacriticsMap[i].letters;
    for (let j = 0; j < letters.length; j++) {
      const regex = new RegExp(letters[j], "g");
      inputString = inputString.replace(regex, base);
    }
  }

  return inputString;
}

export default removeDiacritics;

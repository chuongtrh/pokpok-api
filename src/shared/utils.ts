// deno-lint-ignore-file

import {
  increment,
  Timestamp,
} from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

export default {
  fireStoreTimestamp: (date: Date) => {
    return Timestamp.fromDate(date);
  },
  fireStoreIncrement: (val: number) => {
    return increment(val);
  },
};

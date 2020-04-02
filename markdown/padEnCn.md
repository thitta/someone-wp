對中文文字工作者來說，很常聽見一個準則：

> 中英文交界處必須增加一個空格，避免視覺上過於壅擠[1]。

在部分的軟體或系統中，會自動墊上這樣的空間（例如蘋果與Google的作業系統；或是排版軟體Indesign[2]）；然而，並不是所有讀寫介面都有內建這樣的功能。根據筆者實測，在2020年3月，Facebook的iPhone應用會自動墊上這個空間；但是在Web中則沒有——前者亦不確定是來自iPhone的作業系統，抑或是APP本身的功能。

![中英文交錯的排版](https://someone.tw/wp-content/uploads/2020/03/CnEnPadding.png)圖片：上圖中中英文沒有空間，顯得擁擠；下圖中則添加了半行空格。你覺得有差嗎⋯⋯可以確定的是，有人覺得有差；另外，如老闆／大大們覺得有差，那就肯定有差。

儘管這個空格是很常見的需求。然而，就筆者的觀點來看。在文本原始檔中「手動」添加空格，並不是一個理想的做法。其原因如下：

* 非常容易疏漏。
* 在文本的原始碼中加入非必要的空格會讓管理複雜化，增加修訂、編輯與校對的負擔。
* 不同字體可能有不同適合的空間。
* 以上，花費的精力與效果不成比例。

但如果我們還是希望達成最舒適的排版，要怎麼做呢？個人覺得最好的作法就是在閱讀的輸出端，利用程式自動墊上這個空間。

以本篇部落格為例，當訪客在讀取頁面時，筆者啟動了一段Javascript，會將頁面中部分區塊的內容進行自動化處理。也因此，部落格中所有的文章，中英文間都會自動墊上一個半形空格。

該功能的JS原始碼如下：

```javascript
function getPaddedCnEnString(htmlStr, padding) {
  // ASCII 33~126
  const EN_ALPHA = "!\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
  const EN_SET = new Set(EN_ALPHA.split(""));
  const CN_MARKS = "。，、；：「」『』（）—－？！——⋯⋯〈〉・《》＿～";
  const CN_MARKS_SET = new Set(CN_MARKS.split(""));
  const CN_RANGE_MIN = 0x3400;
  const CN_RANGE_MAX = 0x9FFC;
  // utility function
  const isCn = (char) => ((char.charCodeAt(0) >= CN_RANGE_MIN && char.charCodeAt(0) <= CN_RANGE_MAX) ||
    CN_MARKS_SET.has(char));
  const isEn = (char) => EN_SET.has(char);
  // process
  let result = "";
  let thisIdx = 0;
  while (thisIdx <= htmlStr.length) {
    const thisChar = htmlStr.charAt(thisIdx);
    let nextIdx = thisIdx + 1;
    let nextChar = htmlStr.charAt(nextIdx);
    // copy contents in html tags (do no processing)
    if (thisChar === "<") {
      while (nextIdx <= htmlStr.length && htmlStr[nextIdx - 1] !== ">") {
        nextIdx++;
      }
      result += htmlStr.substring(thisIdx, nextIdx);
      thisIdx = nextIdx;
      continue
    } else if (nextChar === "<") {
      while (nextIdx <= htmlStr.length && htmlStr[nextIdx - 1] !== ">") {
        nextIdx++;
      }
    }
    result += htmlStr.substring(thisIdx, nextIdx);
    nextChar = htmlStr.charAt(nextIdx);
    // compare with next char and pad space if necessary
    if (isCn(thisChar) && isEn(nextChar)) { // 中文_abc
      result += padding;
    } else if (isEn(thisChar) && isCn(nextChar)) { // abc_中文
      result += padding;
    }
    // continue
    thisIdx = nextIdx;
  }
  return result;
}
```
* 函式的輸入為：
  * `htmlStr`：HTML tag的字串
  * `padding`：墊上的內容（你可以使用半形空白`" "`，或是例如`<span>`並透過CSS來調整空間）。
* 函式使用Unicode判斷字元屬於中文還是英文，並將台灣官方的標準標點符號視做中文。以此為判斷，在中英文間加上適當的`padding`。
* 忽略所有html tag中的內容。

舉例來說，如果你的文章位於`<div id="post">的標籤裡，那麼你可以這麼做（使用`jQuery`）[3]

```javascript
$(document.onload).ready(function () {
  const element = $("#post");
  const newHTML = getPaddedCnEnString(element.html()," ");
  element.html(newHTML);
})
```

根據筆者簡單的測試，一份原始碼長5000字左右的markdown文章，以其HTML格式進行轉換，可以控制在5毫秒以內；且不妨礙原本內容的讀取——顯然不會造成太大的前端負擔。

以上，獻給所有對排版有愛的偏執狂們。

## 註解

[1] 儘管就筆者所知，這樣的準則並沒有被明文記載在各大軟體廠的設計文件裡。此外，筆者也很反對將這樣的標準用於判斷寫作者是否專業；更反對用手動處理這個程序——有道是：The space bar is not a design tool。

[2] 出處：知乎｜https://www.zhihu.com/question/19587406。

[3] 文莊育ㄕ如果你可以控制後端的原始碼，也可以將這個轉換放在後端進行。
jQuery(document).ready(function () {
  helloSomeone();
  setSocialLinkTargetBlank();
  setImageDescriptionCSS();
  hidePostFooter();
  hidePrevNexBtn();
  addCC();
  changeDiscussTitle();
  padCnEnAll()
});

function helloSomeone(){
  console.log("Welcome to someone.tw");
}

function setSocialLinkTargetBlank() {
  jQuery("a:not([href^='https://someone.tw'])").attr('target', '_blank');
}

function setImageDescriptionCSS() {
  jQuery(".entry-content p:has('img')").addClass("textDescription");
}

function hidePrevNexBtn() {
  jQuery(".nav-previous").hide();
  jQuery(".nav-next").hide();
}

function hidePostFooter() {
  jQuery(".entry-footer").hide();
}

function addCC() {
  const text="若無特別聲明，本站圖文皆採 CC 授權 [BY-NC-SA]";
  jQuery(".site-info").html(text);
}

function changeDiscussTitle(){
  const text = "留言";
  jQuery("#reply-title").text(text);
}

function padCnEnAll() {
  const SELECTORS = [".entry-title", ".entry-content > div:not(.code-block)"];
  SELECTORS.forEach(function (selector) {
    jQuery(selector).each(function () {
      const e = jQuery(this);
      const newHtml = padBetweenCnEn(e.html(), "<span class='cnEnSpace'></span>");
      e.html(newHtml);
    })
  });
}

function padBetweenCnEn(htmlStr, padding) {
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

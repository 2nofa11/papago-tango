import { ref } from "vue";

// Settings are intentionally NOT persisted, matching the original app: they
// were read straight off DOM defaults and reset on every reload. Defaults
// below mirror the original HTML's initial values exactly.
const newPerDay = ref(100);
const newPerDayUnlimited = ref(false);
const reviewCap = ref(150);
const reviewCapUnlimited = ref(false);
const sessionSize = ref(20);
const rate = ref(1);
const toneColor = ref(true);

function getNewPerDay(): number {
  return newPerDayUnlimited.value ? Infinity : newPerDay.value || 0;
}
function getReviewCap(): number {
  return reviewCapUnlimited.value ? Infinity : reviewCap.value || 150;
}

export function useSettings() {
  return {
    newPerDay,
    newPerDayUnlimited,
    reviewCap,
    reviewCapUnlimited,
    sessionSize,
    rate,
    toneColor,
    getNewPerDay,
    getReviewCap,
  };
}

import { nfd } from "unorm";

/**
 * Scrolls an element with overflow to its bottom.
 *
 * @param containerEl container element that has the overflow-y set on it
 * @returns undefined
 */
export const scrollToBottom = (containerEl: HTMLElement) => {
  if (!containerEl) {
    return;
  }
  const scrollHeight = containerEl.scrollHeight;
  if (containerEl.scrollTo !== undefined) {
    containerEl.scrollTo({
      top: scrollHeight,
      left: 0,
      behavior: "smooth",
    });
  }
};

/**
 * Focuses a heading element that may or may not be visible at the time of the call.
 * See #4690 and #5851
 *
 * @param headingSelector as a string will focus the first matching element. As an array
 * will focus the first matching element in the array. Order matters.
 */
export const focusHeadingBySelector = (headingSelector: string | string[]) => {
  // Give the page a little time to update before looking for the heading element
  setTimeout(() => {
    if (Array.isArray(headingSelector)) {
      headingSelector.some((selector) => {
        const headingEl = document.querySelector(selector) as HTMLHeadingElement;
        if (headingEl) {
          focusHeading(headingEl);
          return true; // Stop searching if we found a heading
        }
      });
      return;
    }

    const headingEl = document.querySelector(headingSelector) as HTMLHeadingElement;
    focusHeading(headingEl);
  }, 40);
};

/**
 * Focus a heading element on page load or page update.
 * @param heading HTMLHeadingElement to focus
 */
export const focusHeading = (heading: HTMLHeadingElement) => {
  if (!heading) {
    return;
  }

  if (heading.getAttribute("tabIndex") === null) {
    heading.setAttribute("tabIndex", "-1");
  }

  // Gives the DOM a little time to update from the above change before focusing
  setTimeout(() => {
    heading.focus();
  }, 40);
};

/**
 * Like a UUID but smaller and not as unique. So best to append this to the element name.
 * e.g. id = `myElementName-${randomId()}`
 *
 * @returns a random number
 */
export const randomId = () => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Format date for: YYYY-MM-DD
 * @param date to format. Expects a Date type
 * @returns date formatted
 */
export const formatDate = (date: Date): string => {
  if (!(date instanceof Date)) {
    return "Unknown";
  }

  const formattedDate = date.toISOString().split("T")[0];
  return formattedDate;
};

/**
 * Get the number of days passed between two dates.
 * @param endDate Date/timestamp second or end date to use to compare against startDate
 * @param startDate (optional) Date/timestamp start date for comparison. Defaults to today's date if none passed
 * @returns number of days passed or -1 for an error
 */
export const getDaysPassed = (endDate: Date | number, startDate?: Date | number): number => {
  // Mainly for unit testing - default to today's date if no date is passed (main case)
  let date1 = null;
  if (!startDate) {
    date1 = new Date();
  } else if (startDate instanceof Date) {
    date1 = startDate;
  } else if (typeof startDate === "number" && String(startDate).length === 13) {
    date1 = new Date(startDate);
  } else {
    return -1; // Invalid date
  }

  // Allow UTC timestamps also - do a very basic check
  const date2 =
    typeof endDate === "number" && String(endDate).length === 13 ? new Date(endDate) : endDate;

  if (!(date1 instanceof Date) || !(date2 instanceof Date)) {
    return -1; // Invalid date
  }

  const daysDiff = Math.abs(Number(date2) - Number(date1));
  const daysPassed = Math.round(daysDiff / (1000 * 60 * 60 * 24));
  return daysPassed;
};

export const getDate = (withTime = false) => {
  let date = new Date();
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return withTime ? date.toISOString() : date.toISOString().split("T")[0];
};

export const slugify = (str: string) => {
  str = nfd(str).replace(/[\u0300-\u036f]/g, ""); // Decompose accented characters
  str = str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return str;
};

/**
 * Capitalize the first letter of a string
 * @param string
 * @returns string with first letter capitalized
 */
export const ucfirst = (string: string) => {
  if (!string || typeof string !== "string") {
    return "";
  }
  return string.charAt(0).toUpperCase() + string.slice(1);
};

export async function runPromisesSynchronously<T>(
  promisesToBeExecuted: (() => Promise<T>)[]
): Promise<T[]> {
  const accumulator: T[] = [];

  for (const p of promisesToBeExecuted) {
    // eslint-disable-next-line no-await-in-loop
    accumulator.push(await p());
  }

  return accumulator;
}

export const truncateString = (str: string, maxLength: number = 50): string => {
  if (!str) return "";
  return str.length > maxLength ? `${str.slice(0, maxLength)}...` : str;
};

// Google Analytics util to simplify firing an event
export const ga = (eventName: string, data?: object) => {
  if (typeof window !== "undefined") {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      ...data,
    });
  }
};

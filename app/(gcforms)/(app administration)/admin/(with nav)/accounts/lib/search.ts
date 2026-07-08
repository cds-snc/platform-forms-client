import type { UserSearchProperty, UserSearchState } from "@lib/users";

export const ACCOUNTS_PAGE_SIZE = 12;
export const DEFAULT_USER_SEARCH_PROPERTY: UserSearchProperty = "email";
const MAX_QUERY_LENGTH = 120;
const MAX_ID_LENGTH = 64;
const MAX_PAGE_NUMBER = 10_000;

export type AccountsSearchState = {
  page: number;
  query: string;
  property: UserSearchProperty;
  userState?: UserSearchState;
  hasFilters: boolean;
};

const getSingleValue = (value?: string | string[]) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const isUserSearchProperty = (value?: string): value is UserSearchProperty => {
  return value === "all" || value === "name" || value === "email" || value === "id";
};

const isUserSearchState = (value?: string): value is UserSearchState => {
  return value === "active" || value === "deactivated";
};

const sanitizeSearchText = (value?: string) => {
  return (value ?? "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);
};

const sanitizeIdSearch = (value?: string) => {
  return sanitizeSearchText(value)
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, MAX_ID_LENGTH);
};

export const parseAccountsSearchParams = (
  searchParams: Record<string, string | string[] | undefined>
) => {
  const id = sanitizeIdSearch(getSingleValue(searchParams.id));
  const query = id || sanitizeSearchText(getSingleValue(searchParams.query));
  const propertyValue = getSingleValue(searchParams.property);
  const userStateValue = getSingleValue(searchParams.userState);
  const pageValue = Number.parseInt(getSingleValue(searchParams.page) ?? "1", 10);

  const property = id
    ? "id"
    : isUserSearchProperty(propertyValue)
      ? propertyValue
      : DEFAULT_USER_SEARCH_PROPERTY;
  const userState = isUserSearchState(userStateValue) ? userStateValue : undefined;
  const page = Number.isNaN(pageValue) || pageValue < 1 ? 1 : Math.min(pageValue, MAX_PAGE_NUMBER);
  const hasFilters = query.length > 0 || typeof userState !== "undefined";

  return {
    page,
    query,
    property,
    userState,
    hasFilters,
  } satisfies AccountsSearchState;
};

export const buildAccountsSearchParams = ({
  page,
  query,
  property,
  userState,
}: {
  page?: number;
  query?: string;
  property?: UserSearchProperty;
  userState?: UserSearchState;
}) => {
  const params = new URLSearchParams();

  const sanitizedQuery = property === "id" ? sanitizeIdSearch(query) : sanitizeSearchText(query);

  if (sanitizedQuery) {
    params.set("query", sanitizedQuery);
  }

  if (property && property !== DEFAULT_USER_SEARCH_PROPERTY) {
    params.set("property", property);
  }

  if (userState) {
    params.set("userState", userState);
  }

  if (page && page > 1) {
    params.set("page", String(page));
  }

  return params;
};

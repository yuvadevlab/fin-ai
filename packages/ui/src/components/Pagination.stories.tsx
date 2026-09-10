import type { Meta, StoryObj } from "@storybook/react";
import { fn } from "@storybook/test";
import { Pagination } from "./Pagination";

/**
 * `Pagination` renders page navigation buttons, current page indicator,
 * total items count, and optional page-size selector.
 */
const meta: Meta<typeof Pagination> = {
  title: "Components / Pagination",
  component: Pagination,
  tags: ["autodocs"],
  args: {
    currentPage: 1,
    totalPages: 10,
    pageSize: 10,
    totalItems: 98,
    showPageSize: true,
    onPageChange: fn(),
    onPageSizeChange: fn(),
  },
  argTypes: {
    currentPage: { control: "number" },
    totalPages: { control: "number" },
    pageSize: { control: "number" },
    totalItems: { control: "number" },
    showPageSize: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Pagination>;

/** First page of a multi-page list. */
export const FirstPage: Story = {};

/** Middle page where both Prev and Next are enabled. */
export const MiddlePage: Story = {
  args: {
    currentPage: 5,
    totalPages: 10,
    totalItems: 100,
  },
};

/** Last page where Next is disabled. */
export const LastPage: Story = {
  args: {
    currentPage: 10,
    totalPages: 10,
    totalItems: 98,
  },
};

/** Without page size selector. */
export const WithoutPageSize: Story = {
  args: {
    showPageSize: false,
  },
};

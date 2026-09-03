import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AccountForm } from "@/features/accounts/components/AccountForm";

describe("AccountForm", () => {
  const mockOnChange = vi.fn();
  const defaultValues = {
    name: "HDFC Savings",
    type: "BANK",
    balance: "10000",
    currency: "INR",
  };
  const defaultErrors = {};

  it("should render all fields in creation mode", () => {
    render(<AccountForm values={defaultValues} errors={defaultErrors} onChange={mockOnChange} />);

    expect(screen.getByLabelText(/Account Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Account Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Initial Balance/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Currency/i)).toBeInTheDocument();
  });

  it("should render only the name field in edit mode", () => {
    render(
      <AccountForm
        values={defaultValues}
        errors={defaultErrors}
        onChange={mockOnChange}
        editMode={true}
      />,
    );

    expect(screen.getByLabelText(/Account Name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Account Type/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/Account type, currency, and balance cannot be changed/i),
    ).toBeInTheDocument();
  });

  it("should call onChange when a field value changes", () => {
    render(<AccountForm values={defaultValues} errors={defaultErrors} onChange={mockOnChange} />);

    const nameInput = screen.getByLabelText(/Account Name/i);
    fireEvent.change(nameInput, { target: { value: "SBI Savings" } });

    expect(mockOnChange).toHaveBeenCalledWith("name", "SBI Savings");
  });

  it("should display validation errors correctly", () => {
    const errors = { name: "Account name is required" };
    render(<AccountForm values={defaultValues} errors={errors} onChange={mockOnChange} />);

    expect(screen.getByText("Account name is required")).toBeInTheDocument();
  });
});

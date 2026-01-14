import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../../src/components/ui/button";

describe("Button Component", () => {
    it("should render button with text", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: /click me/i })).toBeInTheDocument();
    });

    it("should call onClick when clicked", async () => {
        const handleClick = vi.fn();
        const user = userEvent.setup();

        render(<Button onClick={handleClick}>Click me</Button>);
        await user.click(screen.getByRole("button"));

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should be disabled when disabled prop is true", () => {
        render(<Button disabled>Disabled button</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });

    it("should apply variant classes", () => {
        const { container } = render(<Button variant="destructive">Delete</Button>);
        const button = container.querySelector("button");
        expect(button).toHaveClass("bg-destructive");
    });
});

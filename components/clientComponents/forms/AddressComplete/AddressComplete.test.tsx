/**
 * @vitest-environment jsdom
 */
import React, { useImperativeHandle, useState } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AddressComplete } from "./AddressComplete";
import type { AddressCompleteProps } from "./types";

const {
	getFlagMock,
	setValueMock,
	changeInputValueMock,
	getAddressCompleteChoicesMock,
	getSelectedAddressMock,
	getAddressCompleteRetrieveMock,
	matchesAddressPatternMock,
	formikState,
} = vi.hoisted(() => ({
	getFlagMock: vi.fn(() => false),
	setValueMock: vi.fn(),
	changeInputValueMock: vi.fn(),
	getAddressCompleteChoicesMock: vi.fn(),
	getSelectedAddressMock: vi.fn(),
	getAddressCompleteRetrieveMock: vi.fn(),
	matchesAddressPatternMock: vi.fn(() => false),
	formikState: {
		value: "",
		error: undefined as string | undefined,
	},
}));

vi.mock("@lib/hooks/useFeatureFlags", () => ({
	useFeatureFlags: () => ({
		getFlag: getFlagMock,
	}),
}));

vi.mock("formik", async () => {
	const actual = await vi.importActual<typeof import("formik")>("formik");
	return {
		...actual,
		useField: vi.fn(() => [
			{
				name: "address",
				value: formikState.value,
				onChange: vi.fn(),
				onBlur: vi.fn(),
			},
			{
				touched: false,
				error: formikState.error,
			},
			{
				setValue: setValueMock,
				setTouched: vi.fn(),
				setError: vi.fn(),
			},
		]),
	};
});

vi.mock("./utils", () => ({
	getAddressCompleteChoices: getAddressCompleteChoicesMock,
	getSelectedAddress: getSelectedAddressMock,
	getAddressCompleteRetrieve: getAddressCompleteRetrieveMock,
	matchesAddressPattern: matchesAddressPatternMock,
}));

vi.mock("@clientComponents/forms", () => {
	const ManagedCombobox = React.forwardRef((props: any, ref) => {
		const [inputValue, setInputValue] = useState(props.baseValue || "");

		useImperativeHandle(ref, () => ({
			changeInputValue: (value: string, keepOpen: boolean) => {
				changeInputValueMock(value, keepOpen);
				if (!keepOpen) {
					setInputValue(value);
				}
			},
		}));

		const testId = props["data-testid"] || `managed-combobox-${props.id}`;

		return (
			<div data-testid={testId}>
				<input
					id={props.id}
					data-testid={`${props.id}-input`}
					value={inputValue}
					placeholder={props.placeholderText || ""}
					onChange={(e) => {
						setInputValue(e.target.value);
						props.onChange?.(e);
					}}
				/>
				<button type="button" data-testid={`${props.id}-set`} onClick={() => props.onSetValue?.(inputValue)}>
					set
				</button>
				<button
					type="button"
					data-testid={`${props.id}-set-first`}
					onClick={() => props.onSetValue?.(props.choices?.[0] || "")}
				>
					set-first
				</button>
				<div data-testid={`${props.id}-choices`}>{(props.choices || []).join("|")}</div>
			</div>
		);
	});

	ManagedCombobox.displayName = "ManagedCombobox";

	return {
		Label: ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
			<label htmlFor={htmlFor}>{children}</label>
		),
		Description: ({ id, children }: { id: string; children: React.ReactNode }) => <p id={id}>{children}</p>,
		ManagedCombobox,
	};
});

const baseProps: AddressCompleteProps = {
	id: "address",
	name: "address",
	required: false,
	ariaDescribedBy: "Address help text",
	label: "Mailing Address",
	lang: "en",
};

const renderComponent = (props?: Partial<AddressCompleteProps>) => {
	return render(<AddressComplete {...baseProps} {...props} />);
};

describe("AddressComplete", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		getFlagMock.mockReturnValue(false);
		matchesAddressPatternMock.mockReturnValue(false);
		getAddressCompleteChoicesMock.mockResolvedValue([]);
		getSelectedAddressMock.mockResolvedValue(undefined);
		getAddressCompleteRetrieveMock.mockResolvedValue([]);
		formikState.value = "";
		formikState.error = undefined;
		process.env.NEXT_PUBLIC_ADDRESSCOMPLETE_API_KEY = "test-api-key";
	});

	it("renders all address fields and country selector when not canadian-only", async () => {
		renderComponent();

		expect(screen.getByTestId("addressComplete")).toBeInTheDocument();
		expect(screen.getByText("Mailing Address")).toBeInTheDocument();
		expect(screen.getByText("Address help text")).toBeInTheDocument();

		await waitFor(() => {
			expect(screen.getByTestId("managed-combobox-address-streetAddress")).toBeInTheDocument();
		});

		expect(screen.getByTestId("addresscomplete-input-country")).toBeInTheDocument();
		expect(screen.getByTestId("addresscomplete-input-city")).toBeInTheDocument();
		expect(screen.getByTestId("addresscomplete-input-province")).toBeInTheDocument();
		expect(screen.getByTestId("addresscomplete-input-postalCode")).toBeInTheDocument();
	});

	it("renders hidden CAN country input when canadian-only", async () => {
		renderComponent({ canadianOnly: true });

		await waitFor(() => {
			expect(screen.getByTestId("managed-combobox-address-streetAddress")).toBeInTheDocument();
		});

		expect(screen.queryByTestId("addresscomplete-input-country")).not.toBeInTheDocument();
		const hiddenCountry = document.querySelector('input[type="hidden"][name="address-country"]');
		expect(hiddenCountry).toHaveAttribute("value", "CAN");
	});

	it("uses AddressComplete search when feature flag is enabled", async () => {
		const user = userEvent.setup();

		getFlagMock.mockReturnValue(true);
		getAddressCompleteChoicesMock.mockResolvedValue([
			{
				Id: "1",
				Text: "123 Main St",
				Description: "Ottawa",
				Next: "Retrieve",
			},
			{
				Id: "2",
				Text: "123 Main St",
				Description: "Ottawa",
				Next: "Retrieve",
			},
			{
				Id: "3",
				Text: "124 Main St",
				Description: "Ottawa",
				Next: "Retrieve",
			},
		]);

		renderComponent();

		const streetInput = await screen.findByTestId("address-streetAddress-input");
		expect(streetInput).toHaveAttribute("placeholder");
		expect(streetInput.getAttribute("placeholder")).not.toBe("");

		await user.type(streetInput, "123 Main");

		await waitFor(() => {
			expect(getAddressCompleteChoicesMock).toHaveBeenLastCalledWith(
				"test-api-key",
				"123 Main",
				"CAN"
			);
		});

		await waitFor(() => {
			expect(screen.getByTestId("address-streetAddress-choices")).toHaveTextContent(
				"123 Main St, Ottawa|124 Main St, Ottawa"
			);
		});
	});

	it("retrieves and applies selected full address for Retrieve results", async () => {
		const user = userEvent.setup();

		getFlagMock.mockReturnValue(true);
		getAddressCompleteChoicesMock.mockResolvedValue([
			{
				Id: "id-retrieve-1",
				Text: "100 Queen St",
				Description: "Toronto",
				Next: "Retrieve",
			},
		]);
		getSelectedAddressMock.mockResolvedValue({
			streetAddress: "100 Queen St",
			city: "Toronto",
			province: "Ontario",
			postalCode: "M5H 2N2",
			country: "CAN",
		});

		renderComponent();

		const streetInput = await screen.findByTestId("address-streetAddress-input");
		await user.type(streetInput, "100 Queen");

		const setFirst = await screen.findByTestId("address-streetAddress-set-first");
		await user.click(setFirst);

		await waitFor(() => {
			expect(getSelectedAddressMock).toHaveBeenCalledWith("test-api-key", "id-retrieve-1", "CAN", "en");
		});

		await waitFor(() => {
			expect(screen.getByTestId("addresscomplete-input-city")).toHaveValue("Toronto");
			expect(screen.getByTestId("addresscomplete-input-province")).toHaveValue("Ontario");
			expect(screen.getByTestId("addresscomplete-input-postalCode")).toHaveValue("M5H 2N2");
		});

		expect(changeInputValueMock).toHaveBeenCalledWith("100 Queen St", false);
		expect(setValueMock).toHaveBeenLastCalledWith(
			JSON.stringify({
				streetAddress: "100 Queen St",
				city: "Toronto",
				province: "Ontario",
				postalCode: "M5H 2N2",
				country: "CAN",
			})
		);
	});

	it("does nested lookup when selected result next is Find", async () => {
		const user = userEvent.setup();

		getFlagMock.mockReturnValue(true);
		getAddressCompleteChoicesMock.mockResolvedValue([
			{
				Id: "nested-id-1",
				Text: "King St W",
				Description: "Toronto - 15489 Addresses",
				Next: "Find",
			},
		]);
		getAddressCompleteRetrieveMock.mockResolvedValue([
			{
				Id: "nested-id-2",
				Text: "123 King St W",
				Description: "Toronto",
				Next: "Retrieve",
			},
		]);

		renderComponent();

		const streetInput = await screen.findByTestId("address-streetAddress-input");
		await user.type(streetInput, "King");
		await user.click(screen.getByTestId("address-streetAddress-set-first"));

		await waitFor(() => {
			expect(getAddressCompleteRetrieveMock).toHaveBeenCalledWith("test-api-key", "nested-id-1", "CAN");
		});

		expect(changeInputValueMock).toHaveBeenCalledWith("", true);
		expect(screen.getByTestId("address-streetAddress-choices")).toHaveTextContent("123 King St W, Toronto");
	});

	it("resets address fields when country changes and uses selected country for lookup", async () => {
		const user = userEvent.setup();

		getFlagMock.mockReturnValue(true);

		renderComponent();

		const cityInput = await screen.findByTestId("addresscomplete-input-city");
		await user.type(cityInput, "Old City");
		await user.type(screen.getByTestId("addresscomplete-input-province"), "Old Province");
		await user.type(screen.getByTestId("addresscomplete-input-postalCode"), "A1A1A1");

		await user.clear(screen.getByTestId("address-country-input"));
		await user.type(screen.getByTestId("address-country-input"), "France");
		await user.click(screen.getByTestId("address-country-set"));

		await waitFor(() => {
			expect(screen.getByTestId("addresscomplete-input-city")).toHaveValue("");
			expect(screen.getByTestId("addresscomplete-input-province")).toHaveValue("");
			expect(screen.getByTestId("addresscomplete-input-postalCode")).toHaveValue("");
		});

		await user.type(screen.getByTestId("address-streetAddress-input"), "10 Rue");

		await waitFor(() => {
			expect(getAddressCompleteChoicesMock).toHaveBeenLastCalledWith("test-api-key", "10 Rue", "FRA");
		});
	});

	it("does not call AddressComplete APIs when feature flag is disabled", async () => {
		const user = userEvent.setup();
		getFlagMock.mockReturnValue(false);

		renderComponent();

		const streetInput = await screen.findByTestId("address-streetAddress-input");
		await user.type(streetInput, "No API expected");

		expect(getAddressCompleteChoicesMock).not.toHaveBeenCalled();
		expect(getAddressCompleteRetrieveMock).not.toHaveBeenCalled();
		expect(getSelectedAddressMock).not.toHaveBeenCalled();
	});
});

/**
 * @vitest-environment jsdom
 */
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Field } from "formik";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FormStatus } from "@gcforms/types";

import { Form } from "./Form";
import { type FormProps } from "./types";

const mocks = vi.hoisted(() => ({
  executeCaptcha: vi.fn(),
  resetCaptcha: vi.fn(),
  submitForm: vi.fn(),
  isFormClosed: vi.fn(),
  validateOnSubmit: vi.fn(),
  getFormInitialValues: vi.fn(),
  getErrorList: vi.fn(),
  setFocusOnErrorMessage: vi.fn(),
  filterValuesByVisibleElements: vi.fn(),
  copyObjectExcludingFileContent: vi.fn(),
  generateFileChecksums: vi.fn(),
  shouldCheckCaptcha: vi.fn(),
  onSuccess: vi.fn(),
  setCaptchaFail: vi.fn(),
}));

vi.mock("@gcforms/hcaptcha/client", () => ({
  HCaptchaForm: ({
    children,
    captchaEnabled = true,
    onSubmit,
    ref,
  }: {
    children: React.ReactNode;
    captchaEnabled?: boolean;
    onSubmit: (event: React.FormEvent<HTMLFormElement>, token?: string) => void | Promise<void>;
    ref?: React.Ref<{ reset: () => void }>;
  }) => {
    if (typeof ref === "function") {
      ref({ reset: mocks.resetCaptcha });
    }

    return (
      <form
        onSubmit={async (event) => {
          event.preventDefault();

          if (!captchaEnabled) {
            await onSubmit(event);
            return;
          }

          const captchaResult = await mocks.executeCaptcha();
          if (captchaResult.verified) {
            await onSubmit(event, captchaResult.token);
          }
        }}
      >
        {children}
        {captchaEnabled && <div data-testid="captcha" />}
      </form>
    );
  },
  useHCaptcha: () => ({
    captcha: <div data-testid="captcha" />,
    execute: mocks.executeCaptcha,
    reset: mocks.resetCaptcha,
  }),
}));

vi.mock("@gcforms/core", () => ({
  validateOnSubmit: mocks.validateOnSubmit,
}));

vi.mock("app/(gcforms)/[locale]/(form filler)/id/[...props]/actions", () => ({
  submitForm: mocks.submitForm,
  isFormClosed: mocks.isFormClosed,
}));

vi.mock("@lib/formBuilder", () => ({
  getFormInitialValues: mocks.getFormInitialValues,
}));

vi.mock("@lib/validation/validation", () => ({
  getErrorList: mocks.getErrorList,
  setFocusOnErrorMessage: mocks.setFocusOnErrorMessage,
}));

vi.mock("@lib/hooks/useSyncVisibleElementIds", () => ({
  useSyncVisibleElementIds: vi.fn(),
}));

vi.mock("@lib/hooks/useGCFormContext", () => ({
  useGCFormsContext: () => ({
    currentGroup: null,
    getGroupTitle: () => "Group title",
  }),
}));

vi.mock("@lib/formContext", () => ({
  filterValuesByVisibleElements: mocks.filterValuesByVisibleElements,
}));

vi.mock("@lib/utils/form-builder/showReviewPage", () => ({
  showReviewPage: () => false,
}));

vi.mock("@root/lib/utils/shouldCheckCaptcha", () => ({
  shouldCheckCaptcha: mocks.shouldCheckCaptcha,
}));

vi.mock("@lib/fileExtractor", () => ({
  hasFiles: () => false,
  copyObjectExcludingFileContent: mocks.copyObjectExcludingFileContent,
}));

vi.mock("@lib/utils/fileChecksum", () => ({
  generateFileChecksums: mocks.generateFileChecksums,
}));

vi.mock("@root/app/(gcforms)/[locale]/(form filler)/id/[...props]/lib/client/fileUploader", () => ({
  uploadFile: vi.fn(),
}));

vi.mock("@lib/client/clientHelpers", () => ({
  ga: vi.fn(),
}));

const createFormProps = (props: Partial<FormProps> = {}): FormProps => ({
  formRecord: {
    id: "form-id",
    isPublished: true,
    form: {
      titleEn: "Test form",
      titleFr: "Formulaire test",
      introduction: {},
      privacyPolicy: {},
    },
    closedDetails: {},
  } as FormProps["formRecord"],
  initialValues: {},
  language: "en",
  isPreview: false,
  onSuccess: mocks.onSuccess,
  t: ((key: string) => key) as FormProps["t"],
  currentGroup: null,
  setCaptchaFail: mocks.setCaptchaFail,
  renderSubmit: () => <button type="submit">Submit</button>,
  children: [<input key="field" name="field" />],
  ...props,
});

const renderForm = (props: Partial<FormProps> = {}) => render(<Form {...createFormProps(props)} />);

describe("Form", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.executeCaptcha.mockResolvedValue({ verified: true, token: "captcha-token" });
    mocks.submitForm.mockResolvedValue({ id: "form-id", submissionId: "submission-id" });
    mocks.isFormClosed.mockResolvedValue(false);
    mocks.validateOnSubmit.mockReturnValue({});
    mocks.getFormInitialValues.mockReturnValue({});
    mocks.getErrorList.mockReturnValue(null);
    mocks.filterValuesByVisibleElements.mockImplementation((_formRecord, values) => values);
    mocks.copyObjectExcludingFileContent.mockImplementation((values) => ({
      formValuesWithoutFileContent: values,
      fileObjsRef: {},
    }));
    mocks.generateFileChecksums.mockResolvedValue({});
    mocks.shouldCheckCaptcha.mockReturnValue(true);
  });

  it("runs hCaptcha after validation and sends the verified token to the server action", async () => {
    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mocks.submitForm).toHaveBeenCalled());

    expect(mocks.validateOnSubmit).toHaveBeenCalled();
    expect(mocks.executeCaptcha).toHaveBeenCalledOnce();
    expect(mocks.submitForm).toHaveBeenCalledWith({}, "en", "form-id", false, "captcha-token", {});
    expect(mocks.onSuccess).toHaveBeenCalledWith("form-id", "submission-id");
  });

  it("uses provided initial values without rebuilding defaults", () => {
    renderForm({
      initialValues: { field: "from props" },
      children: [<Field key="field" name="field" aria-label="Field" />],
    });

    expect(screen.getByLabelText("Field")).toHaveValue("from props");
    expect(mocks.getFormInitialValues).not.toHaveBeenCalled();
  });

  it("reinitializes Formik values when initial values change", () => {
    const initialProps = createFormProps({
      initialValues: { field: "first" },
      children: [<Field key="field" name="field" aria-label="Field" />],
    });
    const { rerender } = render(<Form {...initialProps} />);

    expect(screen.getByLabelText("Field")).toHaveValue("first");

    rerender(<Form {...initialProps} initialValues={{ field: "second" }} />);

    expect(screen.getByLabelText("Field")).toHaveValue("second");
  });

  it("submits current Formik values", async () => {
    mocks.shouldCheckCaptcha.mockReturnValue(false);
    renderForm({
      initialValues: { field: "before" },
      children: [<Field key="field" name="field" aria-label="Field" />],
    });

    fireEvent.change(screen.getByLabelText("Field"), { target: { value: "after" } });
    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mocks.submitForm).toHaveBeenCalled());

    expect(mocks.submitForm).toHaveBeenCalledWith(
      { field: "after" },
      "en",
      "form-id",
      false,
      undefined,
      {}
    );
  });

  it("passes Formik validateForm and fallback to custom submit renderers", async () => {
    const renderSubmit = vi.fn(({ validateForm, fallBack }) => (
      <button
        type="button"
        onClick={async () => {
          await validateForm();
          fallBack?.();
        }}
      >
        Custom submit
      </button>
    ));

    renderForm({ renderSubmit });

    fireEvent.click(screen.getByRole("button", { name: "Custom submit" }));

    await waitFor(() => expect(mocks.validateOnSubmit).toHaveBeenCalled());
    expect(renderSubmit).toHaveBeenCalledWith({
      validateForm: expect.any(Function),
      fallBack: expect.any(Function),
    });
  });

  it("does not submit when client validation fails", async () => {
    mocks.validateOnSubmit.mockReturnValue({ field: "Required" });
    mocks.getErrorList.mockReturnValue(<div>Required</div>);

    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mocks.validateOnSubmit).toHaveBeenCalled());

    expect(mocks.submitForm).not.toHaveBeenCalled();
  });

  it("does not submit when hCaptcha blocks the request", async () => {
    mocks.executeCaptcha.mockResolvedValue({
      verified: false,
      allowed: false,
      reason: "captcha-error",
    });

    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mocks.executeCaptcha).toHaveBeenCalledOnce());

    expect(mocks.submitForm).not.toHaveBeenCalled();
  });

  it("shows the captcha failure flow when server verification rejects the token", async () => {
    mocks.submitForm.mockResolvedValue({
      id: "form-id",
      error: {
        name: FormStatus.CAPTCHA_VERIFICATION_ERROR,
        message: "Captcha verification failure",
      },
    });

    renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Submit" }));

    await waitFor(() => expect(mocks.setCaptchaFail).toHaveBeenCalledWith(true));

    expect(mocks.resetCaptcha).toHaveBeenCalledOnce();
    expect(mocks.onSuccess).not.toHaveBeenCalled();
  });
});

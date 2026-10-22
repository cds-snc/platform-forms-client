import { getSubmissionsByFormat, fetchSubmissions } from "./actions";
import { getAppSetting } from "@lib/appSettings";
import { getFullTemplateByID } from "@lib/templates/queries/getFullTemplateByID";
import {
  getResponseDownloadCutoff,
  listAllSubmissions,
  retrieveSubmissions,
  updateLastDownloadedBy,
} from "@lib/vault";
import { DownloadFormat } from "@lib/responseDownloadFormats/types";
import { FormServerErrorCodes } from "@lib/types/form-builder-types";
import { VaultStatus, type VaultSubmission } from "@lib/types";
import { getFormSubmissionAttachmentDownloadLink } from "@lib/vault/getFormSubmissionAttachmentDownloadLink";

vi.mock("@lib/auth", () => ({
  auth: vi.fn().mockResolvedValue({ user: { id: "user-id" } }),
}));
vi.mock("@lib/appSettings");
vi.mock("@lib/templates/queries/getFullTemplateByID");
vi.mock("@lib/vault");
vi.mock("@lib/vault/getFormSubmissionAttachmentDownloadLink");

const cutoff = Date.UTC(2026, 8, 16);
const submission = (name: string, createdAt: number): VaultSubmission => ({
  formID: "form-id",
  submissionID: name,
  name,
  createdAt,
  status: VaultStatus.NEW,
  formSubmission: {},
  securityAttribute: "Unclassified",
  confirmationCode: "receipt-code",
  lastDownloadedBy: "user-id",
});

describe("Overdue response server actions", () => {
  beforeEach(() => {
    vi.mocked(getAppSetting).mockResolvedValue("100");
    vi.mocked(getResponseDownloadCutoff).mockResolvedValue(cutoff);
    vi.mocked(getFullTemplateByID).mockResolvedValue({
      id: "form-id",
      name: "Test form",
      form: { titleEn: "Test", titleFr: "Test", layout: [], elements: [] },
      isPublished: true,
      securityAttribute: "Unclassified",
    });
  });

  it.each([
    [submission("recent", cutoff + 1)],
    [submission("overdue", cutoff), submission("recent", cutoff + 1)],
  ])(
    "rejects single and mixed bulk downloads before generating files or updating status",
    async (...items) => {
      vi.mocked(retrieveSubmissions).mockResolvedValue(items);

      const result = await getSubmissionsByFormat({
        formID: "form-id",
        ids: items.map((item) => item.name),
        format: DownloadFormat.HTML,
        lang: "en",
      });

      expect(result).toMatchObject({ code: FormServerErrorCodes.DOWNLOAD_OVERDUE_RESTRICTION });
      expect(updateLastDownloadedBy).not.toHaveBeenCalled();
      expect(getFormSubmissionAttachmentDownloadLink).not.toHaveBeenCalled();
    }
  );

  it("returns the form-wide cutoff even when the visible page only has recent responses", async () => {
    const submissions = [submission("recent", cutoff + 1)];
    vi.mocked(listAllSubmissions).mockResolvedValue({ submissions, submissionsRemaining: false });

    expect(
      await fetchSubmissions({ formId: "form-id", status: "new", lastKey: null })
    ).toMatchObject({ submissions, downloadCutoff: cutoff });
  });

  it("surfaces restriction lookup failures as retrieval errors", async () => {
    vi.mocked(listAllSubmissions).mockResolvedValue({
      submissions: [],
      submissionsRemaining: false,
    });
    vi.mocked(getResponseDownloadCutoff).mockRejectedValue(new Error("Vault unavailable"));

    expect(
      await fetchSubmissions({ formId: "form-id", status: "new", lastKey: null })
    ).toMatchObject({ error: true });
  });
});

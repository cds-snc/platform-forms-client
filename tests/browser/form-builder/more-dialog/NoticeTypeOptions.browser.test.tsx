import { describe, expect, it, vi } from "vitest";
import { page, userEvent } from "vitest/browser";
import { FormElement, FormElementTypes, NoticeType } from "@lib/types";
import { NoticeTypeOptions } from "@formBuilder/[id]/components/dialogs/MoreDialog/NoticeTypeOptions";
import { render } from "../testUtils";

import "@root/styles/app.css";

describe("<NoticeTypeOptions />", () => {
  it("updates the selected notice type", async () => {
    const item: FormElement = {
      id: 1,
      type: FormElementTypes.notice,
      properties: {
        titleEn: "",
        titleFr: "",
        descriptionEn: "",
        descriptionFr: "",
        noticeType: NoticeType.INFO,
      },
    };
    const setItem = vi.fn();

    await render(<NoticeTypeOptions item={item} setItem={setItem} />);

    const select = page.getByRole("combobox");
    await userEvent.selectOptions(select.element(), NoticeType.INFO);
    expect(setItem).toHaveBeenLastCalledWith({
      ...item,
      properties: { ...item.properties, noticeType: NoticeType.INFO },
    });

    await userEvent.selectOptions(select.element(), NoticeType.WARNING);
    expect(setItem).toHaveBeenLastCalledWith({
      ...item,
      properties: { ...item.properties, noticeType: NoticeType.WARNING },
    });

    await userEvent.selectOptions(select.element(), NoticeType.DANGER);
    expect(setItem).toHaveBeenLastCalledWith({
      ...item,
      properties: { ...item.properties, noticeType: NoticeType.DANGER },
    });

    await userEvent.selectOptions(select.element(), NoticeType.SUCCESS);
    expect(setItem).toHaveBeenLastCalledWith({
      ...item,
      properties: { ...item.properties, noticeType: NoticeType.SUCCESS },
    });
  });
});

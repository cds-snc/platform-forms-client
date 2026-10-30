import { Notice as NoticeComponent } from "@clientComponents/forms/Notice/Notice";
import { NoticeType } from "@gcforms/types";

export const Notice = ({ title, description }: { title: string; description: string }) => (
  <div>
    <p className="mb-4">{description}</p>
    <NoticeComponent title={title} type={NoticeType.INFO}>
      <p>{description}</p>
    </NoticeComponent>
  </div>
);

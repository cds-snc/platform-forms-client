import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGroupStore } from "@formBuilder/components/shared/right-panel/treeview/store/useGroupStore";

export const CheckListLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  const router = useRouter();

  const setGroupId = useGroupStore((state) => state.setId);

  const handleClick = (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const hashPart = href.split("#")[1];

    if (hashPart === "formTitle" || hashPart === "privacy-text" || hashPart === "questions") {
      setGroupId("start");
    } else if (hashPart === "confirmation-text") {
      setGroupId("end");
    }

    // Allow state to update before navigation
    setTimeout(() => {
      router.push(href);
    }, 500);
  };

  return (
    <Link onClick={handleClick} href={href}>
      {children}
    </Link>
  );
};

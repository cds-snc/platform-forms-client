import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { Button } from "@clientComponents/globals/Buttons/Button";

export const SaveProgressButton = () => {
  const { getProgressData } = useGCFormsContext();

  return (
    <div className="flex pt-10">
      <Button
        theme="secondary"
        onClick={() => {
          const formData = getProgressData();
          const encodedformDataEn = Buffer.from(JSON.stringify(formData)).toString("base64");

          // Write to file for download
          const element = document.createElement("a");
          element.setAttribute(
            "href",
            "data:text/plain;charset=utf-8," + encodeURIComponent(encodedformDataEn)
          );
          element.setAttribute("download", "progress.txt");
          element.style.display = "none";
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
        }}
      >
        Save Progress
      </Button>
    </div>
  );
};

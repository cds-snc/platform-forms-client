import { Button } from "@clientComponents/globals";
import { useTemplateStore } from "@lib/store/useTemplateStore";
import { FormElement, FormElementTypes, PropertyChoices } from "@lib/types";
import { Label } from "./Label";
import { Input } from "@formBuilder/components/shared/Input";
import { useState } from "react";
import { InfoDetails } from "@formBuilder/components/shared/InfoDetails";

export const ManagedChoicesOptions = ({
  item,
  setItem,
}: {
  item: FormElement;
  setItem: (item: FormElement) => void;
}) => {
  const { getLocalManagedData, addLocalManagedData } = useTemplateStore((s) => {
    return {
      getLocalManagedData: s.getLocalManagedData,
      addLocalManagedData: s.addLocalManagedData,
    };
  });

  const [dataPropertyName, setDataPropertyName] = useState<string>("");

  if (
    ![FormElementTypes.dropdown, FormElementTypes.radio, FormElementTypes.checkbox].includes(
      item.type
    )
  ) {
    return null;
  }

  return (
    <section className="mb-4">
      <InfoDetails summary={"Have a lot of options?"}>
        <p>Convert your list into managedData so you can use it elsewhere on your form.</p>
        <Label htmlFor={`data-label`}>Enter a name for the managed data</Label>
        <div>
          <Input
            id={`data-label`}
            value={dataPropertyName}
            onChange={(e) => setDataPropertyName(e.target.value)}
          />
        </div>

        <Button
          theme="primary"
          onClick={() => {
            const existingData = getLocalManagedData();
            if (existingData && existingData[dataPropertyName]) {
              alert("This name is already in use. Please choose another."); // @TODO
              return;
            }

            addLocalManagedData(dataPropertyName, item.properties.choices as PropertyChoices[]);
            setItem({
              ...item,
              properties: {
                ...item.properties,
                managedChoices: `local.${dataPropertyName}`,
                choices: [],
              },
            });
          }}
        >
          Convert to managed data
        </Button>
      </InfoDetails>
    </section>
  );
};

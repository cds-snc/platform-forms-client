import { FormValues } from "@lib/formContext";
import { FormItem } from "./Review";
import { useGCFormsContext } from "@lib/hooks/useGCFormContext";
import { useMemo } from "react";
import { getLocalizedProperty } from "@lib/utils";
import { logMessage } from "@lib/logger";
import { randomId } from "@lib/client/clientHelpers";


// TODO rename all related to RepeatingSets?
export const DynamicRowElement = ({
  formItem,
  language,
}: {
  formItem: FormItem,
  language: string,

}): React.ReactElement => {
  // TODO pass as prop if  other components use it also
  const { getValues } = useGCFormsContext();

  const dynamicRows = useMemo(() => {
    const formValues:FormValues|void = getValues();
    const element = formItem.originalFormElement

    if (!formValues || !element) {
      return {};
    }

    const parentId = element.id;
    const parentTitle = element.properties?.[getLocalizedProperty("title", language)];
    const subElements = element.properties?.subElements;
    
    // Get the children elements of the Dynamic Row
    const subElementValues = (formValues[parentId] as string[]).map(
      (valueRows, valueRowsIndex) => {
        const subElementsTitle = `${parentTitle} - ${valueRowsIndex + 1}`;

        // Use FormValues as the source of truth and for each FormValue value, map the related
        // subElement title to the FormValue value
        const valueRowsAsArray = Object.keys(valueRows).map(
          (key) => valueRows[key as keyof typeof valueRows]
        );
        
        // Match the FormValue index to the subElement index to assign the Element title
        const titlesMappedToValues = valueRowsAsArray.map((formValue, valueRowIndex) => {
          return {
            label: subElements?.[valueRowIndex].properties?.[getLocalizedProperty("title", language)],
            values: formValue,
            originalFormElement: element,
          } as FormItem;
        });

        // Create the child Dynamic Row
        return {
          label: subElementsTitle,
          values: titlesMappedToValues,
          originalFormElement: element,
        } as FormItem;
      }
    );
  
    // Add the chidlren Dynamic Rows to the parent Dynamic Row
    return {
      title: parentTitle as string,
      values: subElementValues,
      element,
    };
  }, [formItem.originalFormElement, getValues, language]);

  console.log("dynamicRows", dynamicRows)


  // if (!Array.isArray(dynamicRows?.values)) {
  //   return <></>;
  // }

  // TODO maps in maps in maps... break it up already! :)
  return (
    <dl className="my-10">
      <h4>{dynamicRows.title}</h4>



      {dynamicRows.values && dynamicRows.values.map((subElementItem) => {
          return (subElementItem.values as FormItem[])?.map((element) => {
            if (!Array.isArray(element.values)) {
              return (
                <div key={randomId()} className="mb-2">
                  <dt className="mb-2 font-bold">{element.label}</dt>

                  {/* <dd>{formatElementValues(element)}</dd> */}
                  <dd>TODO {JSON.stringify(element)}</dd>
                </div>
              );
            }

// 1st NOT getting to title bit - may want to just re-write from scratch?
// debugger;

            const dlId = randomId();
            // Create a nested DL for each Sub Element list
            return (
              <dl key={dlId} aria-labelledby={dlId} className="my-10">
                <h4 className="italic" id={dlId}>
                  {element.label}
                </h4>
                {element.values.map((elementValues) => {
                  return (
                    <div key={randomId()} className="mb-2">
                      <dt className="mb-2 font-bold">{elementValues.label}</dt>

                      {/* <dd>{formatElementValues(elementValues)}</dd> */}
                      <dd>TODO {JSON.stringify(elementValues)}</dd>
                    </div>
                  );
                })}
              </dl>
            );
        })
      })}
    </dl>
  )
};

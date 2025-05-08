import { type TemplateStore } from "../../types";
// import { transformFormProperties } from "@lib/store/helpers/elements/transformFormProperties";

export const transform: TemplateStore<"transform"> = (set) => (options) => {
  if (!options) {
    //
  }

  set((state) => {
    state.form.elements.forEach((element, index) => {
      // console.log("transforming element", element);
      state.form.elements[index] = { ...element, uuid: "1" };
    });
  });
};

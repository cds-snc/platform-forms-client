import { Submission } from "@lib/types/submission-types";
import { Response, Responses, FormElement, FormElementTypes } from "@lib/types";
import { safeJSONParse } from "@lib/utils";

export function rehydrateFormResponses(payload: Submission) {
  const { form: formRecord, responses } = payload;

  const rehydratedResponses: Responses = {};

  formRecord.form.elements
    .filter((element) => ![FormElementTypes.richText].includes(element.type))
    .forEach((question: FormElement) => {
      switch (question.type) {
        case FormElementTypes.checkbox: {
          rehydratedResponses[question.id] = _rehydrateCheckBoxResponse(responses[question.id]);
          break;
        }
        case FormElementTypes.dynamicRow: {
          const filteredResponses: [string, Response][] = Object.entries(responses)
            .filter(([key]) => {
              const splitKey = key.split("-");
              return splitKey.length > 1 && splitKey[0] === question.id.toString();
            })
            // Here is a trick to catch and unpack checkbox type of reponses
            // We will need some kind of overhaul on how we pass responses from functions to functions
            .map(([key, value]) => {
              if ((value as string).startsWith('{"value"')) {
                return [key, _rehydrateCheckBoxResponse(value)];
              } else {
                return [key, value];
              }
            });

          const dynamicRowResponses = _rehydrateDynamicRowResponses(filteredResponses);
          rehydratedResponses[question.id] = dynamicRowResponses;
          break;
        }
        default:
          rehydratedResponses[question.id] = responses[question.id];
          break;
      }
    });

  return rehydratedResponses;
}

function _rehydrateDynamicRowResponses(responses: [string, Response][]) {
  const rehydratedResponses: Responses[] = [];

  let currentResponse: Responses = {};
  let currentResponseIndex: string | undefined = undefined;

  for (const [key, value] of responses) {
    const splitKey = key.split("-");
    const responseIndex = splitKey[1];
    const responseSubIndex = splitKey[2];

    if (!currentResponseIndex) {
      currentResponseIndex = responseIndex;
      currentResponse[responseSubIndex] = value;
    } else if (currentResponseIndex === responseIndex) {
      currentResponse[responseSubIndex] = value;
    } else {
      currentResponseIndex = responseIndex;
      rehydratedResponses.push(currentResponse);
      currentResponse = {};
      currentResponse[responseSubIndex] = value;
    }
  }

  rehydratedResponses.push(currentResponse);

  return rehydratedResponses;
}

function _rehydrateCheckBoxResponse(response: Response) {
  const responseParsed = safeJSONParse(response as string);
  if (responseParsed?.error || !responseParsed?.value) {
    return [];
  }
  return responseParsed.value;
}

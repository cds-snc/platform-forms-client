import {
  PureAbility,
  AbilityBuilder,
  MatchConditions,
  AbilityClass,
  InferSubjects,
} from "@casl/ability";
import { User } from "next-auth";
import { FormRecord } from "@lib/types";

interface CASL_FormRecord extends FormRecord {
  kind: "FormRecord";
}

type Action = "create" | "read" | "update" | "delete";

type Subject = InferSubjects<CASL_FormRecord>;

export type Abilities = [Action, Subject];

type AppAbility = PureAbility<Abilities, MatchConditions>;
const AppAbility = PureAbility as AbilityClass<AppAbility>;

const lambdaMatcher = (matchConditions: MatchConditions) => matchConditions;

export default function defineAbilityFor(user: User) {
  const { can, build } = new AbilityBuilder(AppAbility);

  can("read", "FormRecord", ({ formID }) => user.id === formID);

  return build({ conditionsMatcher: lambdaMatcher });
}

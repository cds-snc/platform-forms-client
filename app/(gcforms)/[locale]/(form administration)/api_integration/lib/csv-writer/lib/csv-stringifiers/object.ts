import { CsvStringifier } from "./abstract";
import { FieldStringifier } from "../field-stringifier";
import { Field, ObjectHeaderItem, ObjectStringifierHeader } from "../record";
import { isObject, ObjectMap } from "../lang/object";

export class ObjectCsvStringifier extends CsvStringifier<ObjectMap<Field>> {
  constructor(
    fieldStringifier: FieldStringifier,
    private readonly header: ObjectStringifierHeader,
    recordDelimiter?: string,
    private readonly headerIdDelimiter?: string
  ) {
    super(fieldStringifier, recordDelimiter);
  }

  protected getHeaderRecord(): string[] | null {
    if (!this.isObjectHeader) return null;
    return (this.header as ObjectHeaderItem[]).map((field) => field.title);
  }

  protected getRecordAsArray(record: ObjectMap<Field>): Field[] {
    return this.fieldIds.map((fieldId) => this.getNestedValue(record, fieldId));
  }

  private getNestedValue(obj: ObjectMap<Field>, key: string) {
    if (!this.headerIdDelimiter) return obj[key];

    const parts = key.split(this.headerIdDelimiter);
    let current: unknown = obj;
    for (const part of parts) {
      if (!current || typeof current !== "object") return undefined;
      const asObj = current as Record<string, unknown>;
      if (!(part in asObj)) return undefined;
      current = asObj[part];
    }

    return current as Field | undefined;
  }

  private get fieldIds(): string[] {
    return this.isObjectHeader
      ? (this.header as ObjectHeaderItem[]).map((column) => column.id)
      : (this.header as string[]);
  }

  private get isObjectHeader(): boolean {
    return isObject(this.header && this.header[0]);
  }
}

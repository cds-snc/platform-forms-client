export class FormSavingEvent extends Event {
  public href: string;
  constructor(href: string) {
    super("saveformdata", { bubbles: true, cancelable: false });
    this.href = href;
  }
}

export default class TitleInterface<T extends string | number> {
  id: number;
  title?: string;
  subtitle?: T;
  kpi?: string;
  decodedData?: string = "";
  text?: string;

  constructor({
    id,
    title,
    subtitle,
    kpi,
    decodedData = "",
    text = "",
  }: {
    id: number;
    title?: string;
    subtitle?: T;
    kpi?: string;
    decodedData?: string;
    text?: string;
  }) {
    this.id = id;
    this.title = title;
    this.subtitle = subtitle;
    this.kpi = kpi;
    this.decodedData = decodedData;
    this.text = text;
  }
}
